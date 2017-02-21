backbone-socket-sync
====================

A client/server backbone.js model synchronization library using websockets

Build Instructions
------------------
Get the source:
```shell
git clone git://github.com/pearces/backbone-socket-sync.git
```
Install grunt 1.0.x or higher and grunt-cli if it is not present on your system (check with grunt -V):
```
npm install -g grunt-cli
```
Enter the repo directory and download the build and runtime dependencies:
```shell
cd backbone-socket-sync && npm install
```
Build the npm with grunt into the root directory:
```shell
grunt
```

Generated Assets
----------------
Running a build generates or updates the following scripts:

|Filename Pattern|Description|
|------------------|-----------------------------------------------------------------------------------|
|sync-models-client|Client for browser use (es5, includes underscore, backbone, socket.io client)|
|sync-models|NPM for Node including just the bare source (underscore, backbone, socket.io are required)|

Usage Examples
--------------
Using a synced model from a client on port 3000:
```javascript
var socket = io(':3000');
var model = new Models.SyncModel({}, { socket: socket });
```

Using a synced collection from a client on port 3000:
```javascript
var socket = io(':3000');
var collection = new Models.SyncModels({}, { socket: socket });
```

Using a synced model from a Node server on port 3000 using Express:
```javascript
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Models = require('sync-models');

let model = new Models.SyncModel();

// connect the client to the server-side model
io.on('connection', socket => {
    model.attachListeners(socket);
  }
);

server.listen(3000, () => {
  console.log('listening on *:3000');
});
```

Using a synced collection from the server is identical to the above with the exception of the model lines changed to the following:
```javascript
let collection = new Models.SyncModels();

// connect the client to the server-side collection
io.on('connection', socket => {
    collection.attachListeners(socket);
  }
);
```

Testing
-------
To run the provided mocha tests use the following command:
```shell
npm test
```
