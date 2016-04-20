'use strict';

// global app instance
global.app = global.app || {};

// libraries
var _ = require('underscore');
var Backbone = require('backbone');

var Models = app.Models = require('common/models');

// socket instance
app.socket = require('socket.io-client')('http://localhost:3000');

app.model = new Models.SyncModel({}, { socket: app.socket });

// export the app module
module.export = app;
