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

var loadGame = function(req,res,next) {
  gameStore.readGame(req.params.id,function(err,ret) {
    if(err || !ret) { 
      res.send(404);
    } else {
      req.game = ret;
      next();
    }
  });
};

var loadBoard = function(req,res,next) {
  gameStore.readBoard(req.params.id,function(err,ret) {
    if(err || !ret) { 
      res.send(404);
    } else {
      req.board = ret;
      next();
    }
  });
};

var loadField = function(req,res,next) {
  gameStore.readField(req.params.id,req.params.fid,function(err,ret) {
    if(err || !ret) { 
      res.send(404);
    } else {
      req.field = ret;
      next();
    }
  });
};

var loadFields = function(req,res,next) {
  gameStore.readAllFields(req.params.id,function(err,ret) {
    if(err || !ret) { 
      res.send(404);
    } else {
      req.fields = ret;
      next();
    }
  });
};
var saveBoard = function(req,res,next) {
  gameStore.saveBoard(req.params.id,req.body,function(err,ret) {
    if(err || !ret) { 
      res.send(500);
    } else {
      next();
    }
  });
};


var saveField = function(req,res,next) {
  gameStore.saveField(req.params.id,req.body,function(err,ret) {
    console.log("save field "+err);
    if(err) { 
      res.send(500);
    } else {
      next();
    }
  });
};

var saveFields = function(req,res,next) {

  var cb = function(req,res,next) {
    return function(err,ret) {
      console.log("save fields "+err);
      if(err) { 
        res.send(500);
      } else {
        next();
      }
    };
  };

  console.log("save fields");
  if(req.body instanceof Array)
    gameStore.saveField(req.params.id,req.body,cb(req,res,next));
};

app.put('/game/:id/goboard/field/:fid', saveField, function(req,res) {
  res.send(200);
});

app.get('/game/:id/goboard/field/:fid', loadField, function(req,res) {
  res.send(req.field);
});

app.get('/game/:id/goboard/fields', loadFields, function(req,res) {
  res.send(req.fields);
});

app.put('/game/:id/goboard/fields', saveFields, function(req,res) {
  res.send(200);
});

app.put('/game/:id/goboard', saveBoard, function(req,res) {
  res.send(200);
});

app.post('/game/:id/goboard', saveBoard, function(req,res) {
  res.send(200);
});

app.get('/game/:id/goboard', loadBoard, function(req,res) {
  if(req.xhr) {
    console.log("send board");
    res.send(req.board);
  }
});

app.get('/game/:id', loadGame, function(req,res) {
  if(req.xhr) {
    console.log("send game");
    res.send(req.game);
  }
});

app.post('/game', function(req,res) {
  console.log("request: "+JSON.stringify(req.body));
  gameStore.createGame(function(err,ret) {
    if(err) throw err;
    res.send({id:ret});
  });
});

app.error(function(err,req,res,next) {
  console.log("error thrown "+err);
  res.send(404);
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


