var GameModel = Backbone.Model.extend({
  urlRoot: 'game',

  initialize: function() {
    this.boardModel = new GoBoardModel();
    this.boardModel.parent = this;

    // update board and models when game changes
    // todo: is there a better way to do this?
    this.bind('new', this.newGame);    
    this.bind('load', this.loadGame);
  },

  newGame: function(props) {
    var opts = {};
    opts.success = _.bind(function() {
      console.log("save game");
      this.boardModel.clear();
      props && this.boardModel.set(props);
      this.boardModel.save();
    },this);
    this.set({id:undefined}); // unset id
    console.log("new game");
    this.save({},opts);
  },

  loadGame: function(id) {
    var opts = {};
    opts.success = _.bind(function() {
      this.boardModel.fetch();
      this.boardModel.fields.fetch({add:true});
    },this);
    
    opts.error = _.bind(function() {
      this.boardModel.clear();
    },this);
    
    if(id !== this.id) {
      this.set({id:id}); // set new id
      this.fetch(opts);
    }
  }
});
