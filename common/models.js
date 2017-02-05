'use strict';

import _ from 'underscore';
import Backbone from 'backbone';

let Models = {};

const remoteSync = function(method, model, options, socket) {
  let response = null;

  try {
    switch (method) {
      case 'create':
        this.clear();
        this.set(model); // set id too, otherwise every model.save is a create
        break;
      case 'read':
        response = this.attributes; // get id too?
        break;
      case 'update':
        this.clear();
        this.set(model);
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

const attachListeners = function(socket) {
  let model = this;
  const modelEvents = ['create', 'read', 'update', 'patch', 'delete'];
  socket = socket || this.socket;

  _.each(modelEvents, ev => {
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
    deferred.resolve(response);
  }
  else if (error || errorResponse) {
    error = error || response;

    if (options.error) {
      options.error(model, error, options);
    }
    deferred.reject(error.message);
  }

  if (options.complete) {
    options.complete(response);
  }
};

const sync = function(method, model, options) {
   let params = {},
    xhr = {},
    deferred = Backbone.$.Deferred(),
    handler = _.partial(handleResponse, _, model, null, options, deferred),
    errorHandler = _.partial(handleResponse, null, model, _, options, deferred);

  options = options || {};

  if ((!options.data || options.data === null) && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  try {
    model.socket.emit(method, [...arguments]).once('response', handler);
  }
  catch (syncError) {
    errorHandler(syncError);
  }

  xhr = deferred.promise();

  model.trigger('request', model, xhr, options);

  return xhr;
};

Models.SyncModel = Backbone.Model.extend({
  sync: sync,
  attachListeners: attachListeners,

  initialize: function(attributes, options) {
    options = options || {};

    if (options.socket) {
      this.socket = options.socket;
      this.attachListeners();
    }

    Backbone.Model.prototype.initialize.apply(this, arguments);
  }
});

Models.SyncModels = Backbone.Collection.extend({
  model: Models.SyncModel,
  attachListeners: attachListeners,

  sync: sync,

  initialize: function(models, options) {
    options = options || {};

    if (options.socket) {
      this.socket = options.socket;
      this.attachListeners();
    }

    Backbone.Collection.prototype.initialize.apply(this, arguments);
  }
});

//commonjs export
module.exports = Models;

//es6 module export
export default Models;
