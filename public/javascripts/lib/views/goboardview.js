var GoBoardView = Backbone.View.extend({

  tagName: 'canvas',
  id: "go-board",
  attributes: {width: 800, height: 800},

  border: 30,
  radius: 20,

  initialize: function(options) {

    this.parent = options.parent;

    var size = this.model.size();
    this.width = this.attributes.width;
    this.spacing = spacing = (this.width-2*this.border)/(size-1);

    this._FieldViews = [];
    
    this.on('init', function(){
      this.initBoard();
      this.initFields();
    },this);
 
  },

  initFields: function() {
    jc.start(this.id,true);
    var self = this;
    this.model.fields.each(function(f) {
      var point = f.point();
      var p = self.indexToPoint(point[0],point[1]);
      var fv = new FieldView({
        radius: self.radius,
        x: p[0],
        y: p[1],
        model: f,
        boardModel: self.model
      });
      self._FieldViews.push(fv);
    });
  
    jc.start(this.id,true);
  },

  initBoard: function() {
    jc.start(this.id,true);
    jc.rect(0,0,this.width,this.width,"#FFD396",true).level(0);

    // draw lines
    var size = this.model.size();
    var start = this.border;

    for(i=0;i<size;i++,start+=this.spacing) {
      var p1 = [start,this.border];
      var p2 = [start,this.width-this.border];

      jc.line([p1,p2],"#000000").level(1);
      jc.line([p1.reverse(),p2.reverse()],"#000000").level(1);
    }
    
    // draw hoshis
    var half = Math.floor(size/2);
    var hoshis = [[3,3],[size-4,3],[3,size-4],[size-4,size-4],[half,half]];

    var self = this;
    _.each(hoshis,function(index) {
      var p = self.indexToPoint(index[0],index[1]);
        jc.circle(p[0],p[1],3,"#000000",true).level(2);
    });
    jc.start(this.id,true);
  },

  // helper functions
  indexToPoint: function(i,j) {
    var size = this.model.size();
    if(j==undefined) {
      j = Math.floor(i/size);
      i = i%size;
    }
    var x = this.border+i*this.spacing;
    var y = this.border+j*this.spacing;
    return [x,y];
  }

});


