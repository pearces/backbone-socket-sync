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
  sync: sync
});

Models.SyncModels = Backbone.Collection.extend({
  model: Models.SyncModel,
  sync: sync
});

module.exports = Models;
