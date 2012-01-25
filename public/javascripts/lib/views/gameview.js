var GameView = Backbone.View.extend({
  el: "#game",
  initialize: function() {
    console.log(this.el);
    
    // child views
    this.boardView = new GoBoardView({model:this.model.boardModel});
    this.controlView = new ControlView({model:this.model.boardModel});
  }

});

