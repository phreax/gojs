var Router = Backbone.Router.extend({
  routes: {
    "" : "index",
    "games" : "index",
    "games/new": "newGame",
    "games/:id": "loadGame"
  },

  initialize: function() {
  },

  index: function() {
    this.removeViews();
    Views.indexView = new IndexView();
    root.append(Views.indexView.$el);
  },

  removeViews: function() {
     if(Views.gameView) {
      Views.gameView.remove();
    }
     if(Views.indexView) {
      Views.indexView.remove();
    }
  },

  newGame: function() {
    var game = new GameModel();
    Models.currentGame = game;
    
    game.on('created', function(id) {
      router.navigate('/games/'+id);
    });

    
    this.removeViews();
    
    Views.gameView = new GameView({model:game});
    root.html(Views.gameView);
    root.append(Views.gameView.$el);
    Views.gameView.trigger('init');

    game.trigger('new');
  },

  loadGame: function(id) {
  
    var game = new GameModel();
    Models.currentGame = game;
    
    game.on('created', function(id) {
      router.navigate('/games/'+id);
    });

    
    this.removeViews();
    Views.gameView = new GameView({model:game});

    root.append(Views.gameView.$el);
    Views.gameView.trigger('init');
    game.trigger('load',id);
  }

});

var start = function() {
  console.log("Initilize App");

  var socket = new io.connect('http://localhost');

  socket.on('connect',function(data) {
    console.log('connected');
  });

  socket.on('hello',function(data) {
    console.log("receive data: "+data);
  });
  
  window.socket = socket;
  
  window.Views = {}
  window.Models = {}
  window.root = $('#app');

  window.router = new Router();
  Backbone.history.start();
  

  // debug methods
  //
  window.allFields = function() {
    var fields = this.router.gameModel.boardModel.fields.select(function(m) {
      return m.get('state') !== 'free';
    });
    console.log(JSON.stringify(fields));
  } 
};

/*Backbone.sync = function(method,model,options) {
  var socket = window.socket;
  
  var signature = function() {
    var sig = {};
    sig.ep = model.url + (model.id? ('/'+model.id) : '');
    return sig;
  };

  var event = function(operation,sig) {
    var e = operation + ':';
    e += sig.ep;
    return e;
  };

  var create = function() {
    var sign = signature(model);
    var e = event('create',sign);
    console.log('call '+e);

    socket.emit('create',{signature: sign, model: model.toJSON()});
    socket.once(e,function(data) {
      model.id = data.id;
      console.log("create "+sign);
    });
  };

  var read = function() {
    var sign = signature(model);
    var e = event('read',sign);

    socket.emit('read', {signature: sign});
    socket.once(e,function(data) {
      model.set(data);
      options.success();
    });
  };
  
  var update = function() {
    var sign = signature(model);
    var e = event('update',sign);

    socket.emit('update', {signature: sign,model: model.toJSON()});
    socket.once(e,function() {
      console.log('updated '+sign);
    });
  };
 
  var destroy = function() {
    var sign = signature(model);
    var e = event('destroy',sign);

    socket.emit('destroy', {signature: sign});
    socket.once(e,function() {
      console.log('deleted '+sign);
    });
  };

  switch(method) {
    case 'create':
      create();
      break;
  }
};*/


