var GameModel = Backbone.Model.extend({
  urlRoot: 'games',

  initialize: function() {
    this.createBoard();
    // update board and models when game changes
    // todo: is there a better way to do this?
    this.on('new', this.newGame);    
    this.on('load', this.loadGame);
  },

  createBoard: function(props) {
    this.boardModel = new GoBoardModel();
    this.boardModel.parent = this;
  },

  newGame: function(props) {
    var opts = {};
    opts.success = _.bind(function() {
      this.boardModel.clear();
      props && this.boardModel.set(props);
      this.boardModel.save();
      this.trigger('created',this.id);
    },this);
    this.set({id:undefined}); // unset id
    console.log("new game");
    this.save({},opts);
  },

  loadGame: function(id) {
    var opts = {};
    opts.success = _.bind(function() {
      
      this.boardModel.clear();
      this.boardModel.fetch();
      this.boardModel.fields.fetch({add:true,merge:true});
    },this);
    
    opts.error = _.bind(function() {
      console.log('could not load game');
      this.boardModel.clear();
    },this);
    
    this.set({id:id}); // set new id
    this.fetch(opts);
  }
});
