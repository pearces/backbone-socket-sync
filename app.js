'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// server up files in /public
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
