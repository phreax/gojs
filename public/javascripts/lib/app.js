var Router = Backbone.Router.extend({
  routes: {
    "games/new": "newGame",
    "games/:id": "loadGame"
  },

  initialize: function() {
    this.gameModel = new GameModel();
    // create views
    this.gameView = new GameView({model:this.gameModel});
    this.gameModel.on('created', function(id) {
      this.navigate('/games/'+id);
    },this);

  },

  newGame: function() {
    console.log("new game");
    this.gameModel.trigger('new');
    var id = this.gameModel.id;
  },

  loadGame: function(id) {
    console.log("load game "+id);
    this.gameModel.trigger('load',id);
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
  
  window.router = new Router();
  Backbone.history.start();
  
  window.socket = socket;

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


