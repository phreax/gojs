var GameView = Backbone.View.extend({
  id: "game",

  initialize: function() {
    this.boardView = new GoBoardView({model:this.model.boardModel});
    this.controlView = new ControlView({model:this.model.boardModel});
    this.on('init', function() {this.boardView.trigger('init')});
    this.render();
  },

  remove: function() {
    this.boardView.remove();
    this.$el.remove();
  },

  render: function() {
    this.$el.html('');
    this.$el.append(this.boardView.$el);
    this.$el.append(this.controlView.$el);
    return this;
  }

});

