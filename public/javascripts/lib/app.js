var App = Backbone.View.extend({
  el: "#game",
  initialize: function() {
    console.log(this.el);
    this.boardModel = new GoBoardModel();
    this.boardView = new GoBoardView({model: this.boardModel});
    this.controlView = new ControlView({model:this.boardModel});
  }

});

var start = function() {
  console.log("Initilize App");
  window.app = new App;
};
