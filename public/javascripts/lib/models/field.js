var FieldModel = Backbone.Model.extend({
  urlRoot: 'field',
  
  // url relative to parent model
  url: function() {
    var a = this.urlRoot+(this.id!==undefined? ('/'+this.id) : '');
    if(this.parent) {
      a = this.parent.url() + '/' +a;
    }
    return a;
  },
  defaults: {
    "state":     "free"
  },

  initialize: function() {
    this.visited =false; // internal property
    this.bind('change', this.save);
    this.bind('update',this.set);
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

