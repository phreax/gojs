var FieldModel = Backbone.Model.extend({
  defaults: {
    "state":     "free"
  },
  initialize: function() {
    this.visited =false; // internal property
  },
  index: function() {
    return parseInt(this.id,10);
  },
  point: function() {
    var p = this.get('point');
    return [parseInt(p[0],10), parseInt(p[1],10)];
  },
  state: function() {
    return this.get("state");
  },
  setState: function(newstate) {
    this.set({state:newstate});
  },
  clear: function() {
    this.set({state:"free"});
  },
  isFree: function() {
    return this.state() == "free";
  },
  isColor: function() {
    return this.state() == "black" || this.state() == "white";
  }

});

