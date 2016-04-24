'use strict';

var _ = require('underscore');
var Backbone = require('backbone');

var Models = Models || {};

var attachListeners = function(socket) {
  var modelEvents = ['create', 'read', 'update', 'patch', 'delete'];
  socket = socket || this.socket;

  _.each(modelEvents, function(ev) {
    socket.on(ev, function(data) { console.log(arguments); });
  });
};

var sync = function(method, model, options) {
  var params = {},
    xhr = {},
    deferred = Backbone.$.Deferred();

  if ((!options.data || options.data === null) && model && (method === 'create' || method === 'update' || method === 'patch')) {
    params.data = JSON.stringify(options.attrs || model.toJSON(options));
  }

  var error = options.error;
  options.error = function(xhr, textStatus, errorThrown) {
    options.textStatus = textStatus;
    options.errorThrown = errorThrown;
    if (error) error.call(options.context, xhr, textStatus, errorThrown);
  };

  deferred.resolve(model.attributes);

  model.socket.emit(method, Array.prototype.slice.call(arguments));

  //TODO: make a suitable replacement for Backbone.ajax(_.extend(params, options)) call
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

module.exports = Models;
