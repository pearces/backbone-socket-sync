const Models = require('./models');
const io = require('socket.io-client');

// export Models if node or Models, socket.io to global (window) object if in a browser
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = Models;
  }
}
else {
  global.Models = Models;
  global.io = io;
}
