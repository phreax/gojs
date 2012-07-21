var Router = Backbone.Router.extend({
  routes: {
    "" : "index",
    "games" : "index",
    "games/new": "createGame",
    "games/:id": "fetchGame"
  },

  initialize: function() {
  },

  index: function() {
    this.removeViews();
    Views.indexView = new IndexView();
    rootEl.append(Views.indexView.$el);
  },

  removeViews: function() {
     if(Views.gameView) {
      Views.gameView.remove();
    }
     if(Views.indexView) {
      Views.indexView.remove();
    }
  },

  createGame: function() {
    var game = new GameModel();
    Models.currentGame = game;
    
    game.on('created', function(id) {
      router.navigate('/games/'+id);
    });
    
    this.removeViews();
    
    // view must must be inserted into DOM before its
    // rendered, since html5 canvas cannot be rendered
    // without an existing dom element
    Views.gameView = new GameView({model:game});
    rootEl.append(Views.gameView.$el);
    Views.gameView.trigger('init');

    game.trigger('create');
    Collections.games.add(game);
  },

  fetchGame: function(id) {
  
    var game = new GameModel();
    Models.currentGame = game;
    
    game.on('created', function(id) {
      router.navigate('/games/'+id);
    });
    
    this.removeViews();
    Views.gameView = new GameView({model:game});

    rootEl.append(Views.gameView.$el);
    Views.gameView.trigger('init');

    game.trigger('fetch',id);
    Collections.games.add(game);
  }

});

var extendBackbone = function() {

   var getValue = function(object, prop) {
     if (!(object && object[prop])) return null;
     return _.isFunction(object[prop]) ? object[prop]() : object[prop];
   };

  modelProto = Backbone.Model.prototype;

  modelProto.url = function() {
    var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
    if(!this.isNew() && this.collection )
      base =  base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    if(this.parent) {
      base = getValue(this.parent, 'url') + '/' +base;
    }
    return base;
  };
}

var start = function() {
  
  console.log("Initilize App");

  // setup socketio
  var socket = new io.connect('/app');

  /**********************
  * extend libraries
  **********************/

  // set up observer on handlebar templates
  Handlebars.templates = Handlebars.templates || {};
  _.extend(Handlebars, Backbone.Events);

  Handlebars.set = _.bind(function(name,template) {
    _.extend(template,Backbone.Events);
    this.templates[name] = template;
    this.trigger('changed',name);
    this.trigger('changed:'+name);
  },Handlebars);
  
  // extend Backbone
  //
  extendBackbone();
  
  
  /**********************
  * set global variables
  **********************/
  window.socket = socket;
  window.Views = {};
  window.Models = {};
  window.Collections = {};
  Collections.games = new GameCollection();
  window.rootEl = $('#app');
  window.router = new Router();

  Backbone.history.start();
 
};

