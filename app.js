'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Backbone = require('backbone');
const Models = require('./sync-models');

// server up files in /public
app.use(express.static('public'));

// create a test collection 
let collection = new Models.SyncModels();

// connection event handlers
io.on('connection', socket => {
  console.log('connected');

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  collection.attachListeners(socket);
});

global.collection = collection;

server.listen(3000, () => {
  console.log('listening on *:3000');
});
