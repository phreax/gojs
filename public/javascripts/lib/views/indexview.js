var IndexView = Backbone.View.extend({
  id: 'game-index',
  template: 'index',

  initialize: function() {
    this.collection = new GamesCollection();
    console.log(this.collection);
    Handlebars.on('changed:'+this.template,this.render,this);
    this.render();
  },

  render: function() {
    var template = Handlebars.templates[this.template];
    this.$el.html(template({index:'Hello world'}));
  }
});
