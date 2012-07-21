var GameModel = Backbone.Model.extend({
  urlRoot: 'games',

  initialize: function() {
    this.createBoard();
    // update board and models when game changes
    // todo: is there a better way to do this?
    this.on('create', this.createGame);    
    this.on('fetch', this.fetchGame);
  },

  createBoard: function(props) {
    this.boardModel = new GoBoardModel();
    this.boardModel.parent = this;
  },

  createGame: function(props) {
    var opts = {};
    opts.success = _.bind(function() {
      this.boardModel.clear();
      props && this.boardModel.set(props);
      this.boardModel.save();
      this.trigger('created',this.id);
    },this);

    this.save({},opts);
  },

  fetchGame: function(id) {
    var opts = {};
    opts.success = _.bind(function() {
      
      this.boardModel.clear();
      this.boardModel.fetch();
      this.boardModel.fields.fetch({add:true,merge:true});
    },this);
    
    opts.error = _.bind(function() {
      console.log('could not fetch game');
      this.boardModel.clear();
    },this);
    
    this.set({id:id}); // set new id, to fetch the right model
    this.fetch(opts);
  }
});
