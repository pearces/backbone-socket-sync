'use strict';

var Backbone = require('backbone');

var Models = Models || {};

var sync = function(method, model, options) {
  var type = methodMap[method];
  var params = { type: type };

  if ((!options.data || options.data === null) && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  var error = options.error;
  options.error = function(xhr, textStatus, errorThrown) {
    options.textStatus = textStatus;
    options.errorThrown = errorThrown;
    if (error) error.call(options.context, xhr, textStatus, errorThrown);
  };

  var xhr = options.xhr = {}; //TODO: make a suitable replacement for Backbone.ajax(_.extend(params, options)) call
  model.trigger('request', model, xhr, options);

  model.socket.emit.apply(model.socket, arguments);

  return xhr;
};

var methodMap = {
  'create': 'POST',
  'update': 'PUT',
  'patch': 'PATCH',
  'delete': 'DELETE',
  'read': 'GET'
};

Models.SyncModel = Backbone.Model.extend({
  sync: sync,

  initialize: function(attributes, options) {
    options = options || {};

    if (options.socket) {
      this.socket = options.socket;
    }

    Backbone.Model.prototype.initialize.apply(this, arguments);
  }
});

Models.SyncModels = Backbone.Collection.extend({
  model: Models.SyncModel,

  sync: sync,

  initialize: function(models, options) {
    options = options || {};

    if (options.socket) {
      this.socket = options.socket;
    }

    Backbone.Collection.prototype.initialize.apply(this, arguments);
  }
});

module.exports = Models;
