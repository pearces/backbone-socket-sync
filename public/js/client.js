'use strict';

// global app instance
let app = global.app = {};

// libraries
import _ from 'underscore';
import Backbone from 'backbone';
import Models from 'common/models';
import io from 'socket.io';

app.Models = Models;

// socket instance
app.socket = io('http://localhost:3000');

app.model = new Models.SyncModel({}, { socket: app.socket });

// export the app module
export default app;
