/**
 * Module dependencies.
 */
var express      = require('express'),
    app          = module.exports                        = express.createServer(),
    MemoryStore  = express.session.MemoryStore,
    sessionStore = new MemoryStore(),
    parseCookie  = require('connect').utils.parseCookie,
    io           = require('socket.io'),
    GameStore    = require('./lib/gamestore'),
    gameStore    = new GameStore(),
    io           = io.listen(app);

// controller
var games  = require('./controller/games_controller').load(gameStore),
    fields = require('./controller/fields_controller').load(gameStore),
    boards = require('./controller/boards_controller').load(gameStore);

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger({format: ':method :url'}));
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


app.put('/games/:id/board/fields/:fid', fields.update, function(req,res) {
  res.send(200);
});

app.get('/games/:id/board/fields/:fid', fields.show, function(req,res) {
  res.send(req.field);
});

app.get('/games/:id/board/fields', fields.index, function(req,res) {
  res.send(req.fields);
});

app.put('/games/:id/board/fields', fields.update, function(req,res) {
  res.send(200);
});

app.put('/games/:id/board', boards.update, function(req,res) {
  res.send(200);
});

app.post('/games/:id/board', boards.create, function(req,res) {
  res.send(200);
});

app.get('/games/:id/board', boards.show, function(req,res) {
  res.send(req.board);
});

app.get('/games/:id', games.show, function(req,res) {
  res.send(req.game);
});

app.get('/games', games.index); 
app.post('/games', games.create); 

app.error(function(err,req,res,next) {
  console.log("error thrown "+err);
  res.send(404);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


