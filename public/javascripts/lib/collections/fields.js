var Fields = Backbone.Collection.extend({
  
  urlRoot: "fields",
  // url relative to parent model
  url: function() {
    var a = this.urlRoot;
    if(this.parent) {
      a = this.parent.url() + '/' +a;
    }
    return a;
  },
  model: FieldModel
});


