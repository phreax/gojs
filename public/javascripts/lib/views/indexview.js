var IndexView = Backbone.View.extend({
  id: 'game-index',

  initialize: function() {
    this.collection = new GamesCollection();
    console.log(this.collection);
    this.render();
  },

  render: function() {
    this.$el.html('<h1>Game Index</h1><br>'+JSON.stringify(this.collection.models));
  }

})
