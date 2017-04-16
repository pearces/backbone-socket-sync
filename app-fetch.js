'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Backbone = require('backbone');
const Models = require('./sync-models');
const ioClient = require('socket.io-client');

const PORT = 3000;

// server up files in /public
app.use(express.static('public'));

let serverCollection, clientCollection;
serverCollection = new Models.SyncModels();

// attach event listeners to model using the socket from the current connection
io.on('connection', socket => {
  console.log('connected');

  socket.on('disconnect', () => {
    console.log('disconnected');
  });

  serverCollection.attachListeners(socket);
});

// set up client model
let socket = ioClient(`ws://localhost:${PORT}`);
clientCollection = new Models.SyncModels({}, { socket });

const data = { foo: 1 };
serverCollection.add(data);

clientCollection.fetch({
  success: (collection, response, options) => {
    console.log('success', clientCollection.models[0], response, options);
  },
  error: (collection, response, options) => {
    console.log('error', response);
  }
});

console.log('success', clientCollection.models[0]);

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
