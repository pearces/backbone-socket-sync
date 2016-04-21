'use strict';

var Backbone = require('backbone');

var Models = Models || {};

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

  model.socket.emit(method, Array.prototype.slice.call(arguments, 1));

  //TODO: make a suitable replacement for Backbone.ajax(_.extend(params, options)) call
  xhr = deferred.promise();

  model.trigger('request', model, xhr, options);

  return xhr;
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
