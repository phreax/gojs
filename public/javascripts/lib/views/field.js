var FieldView = Backbone.View.extend({

  colors: {1: "#000000", 2: "#ffffff"},

  currentColor: function() {
    var player = this.boardModel.nextPlayer();
    return this.colors[player];
  },

  initialize: function() {

    _.extend(this,this.options);
    this.stone = jc.circle(this.x,this.y,this.radius,"rgba(0,0,0,0.0)",true).level(5);

    // TODO make this more pretty, abstract rendering
    _.bindAll(this,"render","click","mouseover","mouseout");
    this.model.bind('change', this.render);

    // local state
    this.ismouseover = false;

    // delegate jcanvascript events
    _.extend(this.stone, {
      onmouseclick: this.click,
      onmouseover:  this.mouseover,
      onmouseout:   this.mouseout,
    });
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
        this.stone.opacity(0.3);
      }
    }
  },

  click: function() {
    if(this.model.isFree()) {
      this.boardModel.playMove(this.model);
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

