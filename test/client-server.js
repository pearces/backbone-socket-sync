const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Models = require('../sync-models');
const ioClient = require('socket.io-client');
const assert = require('assert');
const _ = require('underscore');
const PORT = 3000;

before(done => {
  // start the server and initialize the client and models once it's up
  server.listen(PORT, done);
});

describe('Client-server model tests', () => {
  let serverModel, clientModel;

  // compare the attributes of two models and assert whether they are the same
  const compareModels = (...models) =>
    assert.equal(...models.map(model =>
      JSON.stringify(model.attributes)
    )
  );

  before(() => {
    serverModel = new Models.SyncModel();

    // attach event listeners to model using the socket from the current connection
    io.on('connection', socket => {
      serverModel.attachListeners(socket);
    });

    // set up client model
    let socket = ioClient(`ws://localhost:${PORT}`);
    clientModel = new Models.SyncModel({}, { socket });
  });

  it('should set a value on the server model', () => {
    // create some test data and set it on the server model
    const data = { foo: 1 };
    serverModel.set(data);

    assert.equal(JSON.stringify(serverModel.attributes), JSON.stringify(data));
  });

  it('client should get server model attributes', done => {
    clientModel.fetch({
      success: (model, response, options) => {
        // check the client attributes against the server model (excluding the id)
        assert.equal(JSON.stringify(_.omit(model.attributes, 'id')), JSON.stringify(serverModel.attributes));
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });

  it('server should get changed client attributes', done => {
    const data = { bar: 2 };

    clientModel.save(data, {
      success: (model, response, options) => {
        // check the server attributes against the client model
        compareModels(model, serverModel);
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });

  it('client should get changed server attributes', done => {
    const data = { thing: 3 };

    serverModel.save(data, {
      success: (model, response, options) => {
        // check the client attributes against the server model
        compareModels(model, clientModel);
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });

  it('server should get patched attributes from client', done => {
    const data = { patched: true };

    clientModel.save(data, {
      patch: true,
      success: (model, response, options) => {
        // check the server attributes against the client model
        compareModels(model, serverModel);
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });

  it('server should get cleared attributes from client', done => {
    clientModel.clear();
    clientModel.save({}, {
      success: (model, response, options) => {
        // check the server attributes against the client model
        compareModels(model, serverModel);
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });

  it('server should delete model when destroyed on the client', done => {
    clientModel.destroy({
      success: (model, response, options) => {
        // check the server attributes against the client model
        compareModels(model, serverModel);
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });

  after(() => {
    // disconnect the client socket and shut down the server
    clientModel.socket.disconnect();
  });
});

describe('Client-server collection tests', () => {
  let serverCollection, clientCollection;

  // compare the attributes of two collections' models and assert whether they are the same
  const compareCollections = (...collections) =>
    assert.equal(...collections.map(collection =>
      JSON.stringify(collection.models.map(model =>
        model.attributes)
      )
    )
  );

  before(() => {
    serverCollection = new Models.SyncModels();

    // attach event listeners to model using the socket from the current connection
    io.on('connection', socket => {
      serverCollection.attachListeners(socket);
    });

    // set up client model
    let socket = ioClient(`ws://localhost:${PORT}`);
    clientCollection = new Models.SyncModels({}, { socket });
  });

  it('client should get a new model in the server collection', () => {
    // create some test data and set it on the server collection
    const data = { foo: 1 };
    serverCollection.add(data);

    clientCollection.fetch({
      success: (collection, response, options) => {
        // check the client attributes against the server model
        compareCollections(serverCollection, clientCollection);
        done();
      },
      error: (collection, response, options) => {
        done(response);
      }
    });
  });

  after(() => {
    // disconnect the client socket and shut down the server
    clientCollection.socket.disconnect();
  });
});

after(done => {
  server.close(done);
});
