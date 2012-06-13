var ControlView = Backbone.View.extend({

  id: 'control',

  events: {
    "click .button.clear" : "clear"
  },

  template: Handlebars.templates['control'],

  initialize: function(options) {
    this.model.on('change',this.render,this);
    this.render();
  },

  clear: function() {
    this.model.clear();
  },

  render: function() {
    this.updateStats();
    return this;
  },

  updateStats: function() {
    $(this.el).html(this.template({player: this.model.nextPlayer()}));
  }

});


