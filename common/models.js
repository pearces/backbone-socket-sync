'use strict';

var Backbone = require('backbone');

var Models = Models || {};

Models.SyncModel = Backbone.Model.extend({
});

Models.SyncModels = Backbone.Collection.extend({
  model: Models.SyncModel
});

module.exports = Models;
