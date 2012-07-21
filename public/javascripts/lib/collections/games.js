var GameCollection = Backbone.Collection.extend({
  url: 'games',
  model: GameModel,
});
