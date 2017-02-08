const Models = require('./models');
const io = require('socket.io-client');

// export Models, socket.io to global (window) object
global.Models = Models;
global.io = io;
