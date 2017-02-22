import _ from 'underscore';
import Backbone from 'backbone';

let Models = {};

const remoteSync = function(method, model, options, socket) {
  let response = null;

  try {
    switch (method) {
      case 'create':
        this.clear();
        this.set(model);
        break;
      case 'read':
        response = _.extend({ id: this.id }, this.attributes);
        break;
      case 'update':
        this.clear();
        this.set(model);
        response = this.attributes;
        break;
      case 'patch':
        this.set(model);
        break;
      case 'delete':
        this.destroy();
        break;
    }
  }
  catch (error) {
    response = {
      name: error.name,
      message: error.message
    };
  }

  socket.emit('response', response);
};

const attachListeners = function(socket = this.socket) {
  let model = this;
  const modelEvents = ['create', 'read', 'update', 'patch', 'delete'];

  modelEvents.forEach(ev => {
    socket.on(ev, data => {
      remoteSync.apply(model, data.concat(socket));
    });
  });
};

const isError = obj =>
  obj && obj.name && obj.message && obj.name === 'Error';

const handleResponse = (response, model, error, options, deferred) => {
  let errorResponse = isError(response);

  if (response && !errorResponse) {
    if (options.success) {
      options.success(response);
    }
    if (deferred) {
      deferred.resolve(response);
    }
  }
  else if (error || errorResponse) {
    error = error || response;

    if (options.error) {
      options.error(model, error, options);
    }

    if (deferred) {
      deferred.reject(error.message);
    }
  }

  if (options.complete) {
    options.complete(response);
  }
};

const sync = function(method, model, options = {}) {
  let params = {},
    xhr = {},
    deferred = Backbone.$.Deferred && Backbone.$.Deferred(),
    handler = _.partial(handleResponse, _, model, null, options, deferred),
    errorHandler = _.partial(handleResponse, null, model, _, options, deferred);

  if ((!options.data || options.data === null) && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  try {
    model.socket.emit(method, [...arguments]).once('response', handler);
  }
  catch (syncError) {
    errorHandler(syncError);
  }

  if (deferred) {
    xhr = deferred.promise();
  }

  model.trigger('request', model, xhr, options);

  return xhr;
};

const id = () =>
  Math.random().toString(36).substr(2, 9);

Models.SyncModel = Backbone.Model.extend({
  sync: sync,
  attachListeners: attachListeners,

  initialize: function(attributes = {}, options = {}) {
    if (options.socket) {
      this.socket = options.socket;
      this.attachListeners();
    }

    // set the id if it isn't in the attributes and doesn't yet exist
    if (!attributes.id && !this.id) {
      this.id = id();
    }

    Backbone.Model.prototype.initialize.apply(this, arguments);
  }
});

Models.SyncModels = Backbone.Collection.extend({
  model: Models.SyncModel,
  attachListeners: attachListeners,

  sync: sync,

  initialize: function(models, options = {}) {

    if (options.socket) {
      this.socket = options.socket;
      this.attachListeners();
    }

    Backbone.Collection.prototype.initialize.apply(this, arguments);
  }
});

// commonjs export
module.exports = Models;

// es6 module export
export default Models;
