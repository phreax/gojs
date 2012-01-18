var App = Backbone.View.extend({
  el: "#game",
  initialize: function() {
    console.log(this.el);
    
    this.boardModel = new GoBoardModel();
    this.boardModel.save();

    this.boardView = new GoBoardView({model: this.boardModel});
    this.controlView = new ControlView({model:this.boardModel});


  }

});

Backbone.sync = function(method,model,options) {
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
};

var Router = Backbone.Router.extend({
  
})

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

  window.app = new App;
};
