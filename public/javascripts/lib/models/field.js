var FieldModel = Backbone.Model.extend({
  urlRoot: 'fields',
  
  // url relative to parent model
//url: function() {
//  var a = this.urlRoot+(this.id!==undefined? ('/'+this.id) : '');
//  if(this.parent) {
//    a = this.parent.url() + '/' +a;
//  }
//  return a;
//},

  defaults: {
    "state":     "free"
  },

  initialize: function() {
    this.visited =false; // internal property
    this.on('change', function() {
      this.save(); 
      console.log(['field',this.id,'changed'].join(':'));
    },this);

    this.on('update',this.set);
  },

  index: function() {
    return parseInt(this.id,10);
  },
  point: function() {
    var p = this.get('point').split(',');
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

