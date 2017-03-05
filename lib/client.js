const Models = require('./models');
const io = require('socket.io-client');

// export Models if in node or browserify
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Models;
  }
}

// export Models, socket.io to global (window) object if in a browser
if (typeof window !== 'undefined') {
  global.Models = Models;
  global.io = io;
}
