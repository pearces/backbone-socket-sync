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
        this.set(model);
        response = this.attributes;
        break;
      case 'read':
        if (this instanceof Models.SyncModel) {
          response = _underscore2.default.extend(this.idAttribute ? {} : { id: this.id }, this.attributes);
        } else {
          response = this.models.map(function (model) {
            return model.attributes;
          });
        }
        break;
      case 'update':
        this.clear();
        this.set(model);
        response = this.attributes;
        break;
      case 'patch':
        this.set(model);
        response = this.attributes;
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

  modelEvents.forEach(function (ev) {
    socket.on(ev, function (data) {
      remoteSync.apply(model, data.concat(socket));
    });
  });

  if (!this.socket) {
    this.socket = socket;
  }
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
    if (deferred) {
      deferred.resolve(response);
    }
  } else if (error || errorResponse) {
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

var sync = function sync(method, model) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var xhr = {},
      deferred = _backbone2.default.$.Deferred && _backbone2.default.$.Deferred(),
      handler = _underscore2.default.partial(handleResponse, _underscore2.default, model, null, options, deferred),
      errorHandler = _underscore2.default.partial(handleResponse, null, model, _underscore2.default, options, deferred);

  try {
    model.socket.emit(method, [].concat(Array.prototype.slice.call(arguments))).once('response', handler);
  } catch (syncError) {
    errorHandler(syncError);
  }

  if (deferred) {
    xhr = deferred.promise();
  }

  model.trigger('request', model, xhr, options);

  return xhr;
};

var id = function id() {
  return Math.random().toString(36).substr(2, 9);
};

Models.SyncModel = _backbone2.default.Model.extend({
  sync: sync,
  attachListeners: attachListeners,

  initialize: function initialize() {
    var attributes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.socket) {
      this.attachListeners(options.socket);
    }

    // set the id if it isn't in the attributes and doesn't yet exist
    if (!attributes.idAttribute && !attributes.id && !this.id) {
      this.id = id();
    }

    _backbone2.default.Model.prototype.initialize.apply(this, arguments);
  }
});

Models.SyncModels = _backbone2.default.Collection.extend({
  model: Models.SyncModel,
  attachListeners: attachListeners,

  sync: sync,

  initialize: function initialize(models) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (options.socket) {
      this.attachListeners(options.socket);
    }

    _backbone2.default.Collection.prototype.initialize.apply(this, arguments);
  }
});

// commonjs export
module.exports = Models;

// es6 module export
exports.default = Models;
