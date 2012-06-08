var ControlView = Backbone.View.extend({

  el: "#game .control",

  events: {
    "click .button.clear" : "clear"
  },

  template: _.template("<b>Current Player: </b> <%=player%>"),

  initialize: function() {
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
    $(this.el).find(".stats").html(this.template({player:this.model.nextPlayer()}));
  }

});


