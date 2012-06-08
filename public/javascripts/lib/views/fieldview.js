var FieldView = Backbone.View.extend({

  colors: {black: "#000000", white: "#ffffff"},

  currentColor: function() {
    var player = this.boardModel.nextPlayer();
    console.log("player: "+player);
    console.log(JSON.stringify(this.model.attributes));
    return this.colors[player];
  },

  initialize: function() {

    _.extend(this,this.options);
    this.stone = jc.circle(this.x,this.y,this.radius,"rgba(0,0,0,0.0)",true).level(5);

    _.bindAll(this,"render","click","mouseover","mouseout");
    this.model.on('change', this.render);

    // local state
    this.ismouseover = false;

    // delegate mouse events
    this.stone.mouseover(this.mouseover);
    this.stone.mouseout(this.mouseout);
    this.stone.click(this.click);
  },
  
  render: function() {
    
    if(this.model.isColor()) {
      var color = this.colors[this.model.state()];
      this.stone.color(color);
      this.stone.opacity(1.0);
    } 
    else if(this.model.isFree()) {
      this.stone.opacity(0.0);
      if(this.ismouseover) {
        var color = this.currentColor();
        this.stone.color(color);
        this.stone.opacity(0.5);
      }
    }
  },

  // event handlers for mouse events
  click: function() {
    if(this.model.isFree()) {
      this.boardModel.trigger('play',this.model);
    }
  },

  mouseover: function() {
    this.ismouseover = true;
    this.render();
  },
  
  mouseout: function() {
    this.ismouseover = false;
    this.render();
  }

});

