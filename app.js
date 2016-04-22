'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Backbone = require('backbone');
const Models = require('./common/models');

// server up files in /public
app.use(express.static('public'));

// create a test model
//let model = new Models.SyncModel({}, { socket: io });
let model = new Backbone.Model();
model.sync = () => {}; //TODO: provide an object-backed sync

// connection event handlers
io.on('connection', (socket) => {
  console.log('connected');

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  const modelEvents = ['create', 'read', 'update', 'patch', 'delete'];
  modelEvents.forEach(ev => socket.on(ev, (data) => model.sync.apply(Array.prototype.concat(ev, data)))); //TODO: make this work in a sync-less way
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
