var GamesCollection = Backbone.Collection.extend({
  url: 'games',
  model: GameModel,

  initialize: function() {
    this.fetch();
  }
});
