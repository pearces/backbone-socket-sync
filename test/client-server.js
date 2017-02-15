const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Models = require('../sync-models');
const ioClient = require('socket.io-client');
const assert = require('assert');


let serverModel, clientModel;

before(done => {
  const PORT = 3000;

  // start the server and initialize the client and models once it's up
  server.listen(PORT, () => {
    serverModel = new Models.SyncModel();

    // attach event listeners to model using the socket from the current connection
    io.on('connection', socket => {
      serverModel.attachListeners(socket);
    });

    // set up client model
    let socket = ioClient(`ws://localhost:${PORT}`);
    clientModel = new Models.SyncModel({}, { socket });

    done();
  });
});

describe('Client-server tests', () => {
  it('should set a value on the server model', () => {
    // create some test data and set it on the server model
    const data = { foo: 1 };
    serverModel.set(data);

    return assert.equal(JSON.stringify(serverModel.attributes), JSON.stringify(data));
  });

  it('client should get server model attributes', done => {
    clientModel.fetch({
      success: (model, response, options) => {
        // check the client attributes against the server model
        assert.equal(JSON.stringify(model.attributes), JSON.stringify(serverModel.attributes));
        done();
      },
      error: (model, response, options) => {
        done(response);
      }
    });
  });
});

after(done => {
  // disconnect the client socket and shut down the server
  clientModel.socket.disconnect();
  server.close(done);
});
