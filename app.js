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
let model = new Models.SyncModel();

// connection event handlers
io.on('connection', (socket) => {
  console.log('connected');

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  model.attachListeners(socket);
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
