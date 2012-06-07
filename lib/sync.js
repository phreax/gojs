// Synchronize models via socket.io
// socket.io stuff

var parseCookie = require('connect').utils.parseCookie,
    io          = require('socket.io'),
    GameStore   = require('./gamestore'),
    gameStore   = new GameStore();

module.exports = function(app,sessionStore) {
 
  io = io.listen(app);
  
  io.set('authorization', function(data, accept) {
    if(data.headers.cookie) {
      data.cookie = parseCookie(data.headers.cookie);
      data.sessionID = data.cookie['express.sid'];
      console.log('authorization: '+data.sessionID);
    } else {
      return accept('No cookie transmitted.',false);
    }
    accept(null,true);
  });

  // keep track of clients
  var clients = {};

  io.sockets.on('connection', function(client) {
    var sid = client.handshake.sessionID;
    clients[sid] = client; 
    console.log('connected: '+sid);

    client.on('disconnect', function() {
      console.log('disconnected:' + sid);
      delete client[sid];
    });

    client.on('create',function(data) {
      console.log("create "+data);
    });
  });

}


