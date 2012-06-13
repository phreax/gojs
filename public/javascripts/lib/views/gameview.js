var GameView = Backbone.View.extend({
  id: "game",

  initialize: function() {
    // child views
    this.boardView = new GoBoardView({model:this.model.boardModel});
    this.controlView = new ControlView({model:this.model.boardModel});
    this.render();
  },

  render: function() {
    this.$el.html('');
    this.$el.append(this.boardView.$el);
    this.$el.append(this.controlView.$el);
    $('#app').append(this.$el);
    this.boardView.trigger('init');
    return this;
  }

});

