'use strict';

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname + '/public/' });
});

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('disconnect', () => {
    console.log('disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
