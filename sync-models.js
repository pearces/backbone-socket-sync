'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Models = {};

var remoteSync = function remoteSync(method, model, options, socket) {
  var response = null;

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
  } catch (error) {
    response = {
      name: error.name,
      message: error.message
    };
  }

  socket.emit('response', response);
};

var attachListeners = function attachListeners(socket) {
  var model = this;
  var modelEvents = ['create', 'read', 'update', 'patch', 'delete'];
  socket = socket || this.socket;

  modelEvents.forEach(function (ev) {
    socket.on(ev, function (data) {
      remoteSync.apply(model, data.concat(socket));
    });
  });
};

var isError = function isError(obj) {
  return obj && obj.name && obj.message && obj.name === 'Error';
};

var handleResponse = function handleResponse(response, model, error, options, deferred) {
  var errorResponse = isError(response);

  if (response && !errorResponse) {
    if (options.success) {
      options.success(response);
    }
    deferred.resolve(response);
  } else if (error || errorResponse) {
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

var sync = function sync(method, model, options) {
  var params = {},
      xhr = {},
      deferred = _backbone2.default.$.Deferred(),
      handler = _underscore2.default.partial(handleResponse, _underscore2.default, model, null, options, deferred),
      errorHandler = _underscore2.default.partial(handleResponse, null, model, _underscore2.default, options, deferred);

  options = options || {};

  if ((!options.data || options.data === null) && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  try {
    model.socket.emit(method, [].concat(Array.prototype.slice.call(arguments))).once('response', handler);
  } catch (syncError) {
    errorHandler(syncError);
  }

  xhr = deferred.promise();

  model.trigger('request', model, xhr, options);

  return xhr;
};

Models.SyncModel = _backbone2.default.Model.extend({
  sync: sync,
  attachListeners: attachListeners,

  initialize: function initialize(attributes, options) {
    options = options || {};

    if (options.socket) {
      this.socket = options.socket;
      this.attachListeners();
    }

    _backbone2.default.Model.prototype.initialize.apply(this, arguments);
  }
});

Models.SyncModels = _backbone2.default.Collection.extend({
  model: Models.SyncModel,
  attachListeners: attachListeners,

  sync: sync,

  initialize: function initialize(models, options) {
    options = options || {};

    if (options.socket) {
      this.socket = options.socket;
      this.attachListeners();
    }

    _backbone2.default.Collection.prototype.initialize.apply(this, arguments);
  }
});

// commonjs export
module.exports = Models;

// es6 module export
exports.default = Models;
