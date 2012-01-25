/**
 * Module dependencies.
 */

var express = require('express'),
    app = module.exports = express.createServer(),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore(),
    parseCookie = require('connect').utils.parseCookie,
    io          = require('socket.io'),
    GameStore   = require('./lib/gamestore'),
    gameStore   = new GameStore(),
    io = io.listen(app);


// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({store: sessionStore, secret:"string",key: "express.sid"}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// define REST api
app.get('/', function(req, res){
  res.render('index', {
    title: 'GoJS'
  });
});

app.post('/game', function(req,res) {
  console.log("request: "+JSON.stringify(req.body));
  gameStore.createGame(function(err,ret) {
    if(err) throw err;
    res.send({id:ret});
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


