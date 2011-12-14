var State = {
  free:  0,
  black: 1,
  white: 2, 
  ko: 3
};

var FieldModel = Backbone.Model.extend({
  defaults: {
    "state": State.free,
  },
  initialize: function() {
    this.visited =false; // internal property
  },
  index: function() {
    return parseInt(this.id,10);
  },
  state: function() {
    return this.get("state");
  },
  setState: function(newstate) {
    this.set({state:newstate});
  },
  clear: function() {
    this.set({state:State.free});
  },
  isFree: function() {
    return this.state() == State.free;
  },
  isColor: function() {
    return this.state() == State.black || this.state() == State.white;
  }
  

});

var GoBoard = Backbone.Collection.extend({
  model: FieldModel,
  

  initialize: function() {
    _.extend(this,this.options);
  },
  
});

var GoBoardModel = Backbone.Model.extend({
  
  defaults: {
    "nextPlayer":1, // black player
    "size":19
  },

  initialize: function() {
    this.board = new GoBoard();
    this.set({board: this.board});
    
    var size = this.size();
    for(i in _.range(size*size)) this.board.add({id:i});

  },
  
  size: function() {return this.get('size');},
  nextPlayer: function() {return this.get('nextPlayer');},

  nextPlayerJSON: function() {
    var player = this.nextPlayer() == State.black? "black" : "white";
    return {player:player};
  },
  
  fieldAt: function(i,j) {
    var size = this.size()
    if(!j) {
      if(i<0) return;
      i = i%size;
      j = Math.floor(i/size);
    }
    if(i<0||i>=size||j<0||j>=size) return undefined;
    return this.board.at(i+j*size);
  },
  playMove: function(field,color) {
    color = color || this.nextPlayer();
    field.setState(color);

    this.togglePlayer();

  },

  togglePlayer: function() {
    if(this.nextPlayer()==2) {
      this.set({nextPlayer:1});
    }
    else {
      this.set({nextPlayer:2});
    }
    
    console.log("nextplayer: "+this.nextPlayer());
  },

  clear: function() {
    this.board.each(function(field) {
      field.clear();
    });
  },

  //go logic
  //
/*  neighborhood: function(i,j) {
    if(!j) {
      // one dimensional input, one dimensional output
      return [i-1,i+1,i-this.size(),i+this.size()];
    }
    // two dimensional input, two dimensional output
    return [[i-1,j],[i,j+1],[i,j-1],[i+1,j]];
  },
*/
  neighborhood: function(f) {
    var dirs = [-1,1,-this.size(),this.size()];
    var self = this;
    return _.reduce(dirs,function(m,d) {
      //console.log("field at: "+f.index()+"+"+d+"="+(f.index()+d));
      n = self.fieldAt(f.index()+d);
      //console.log(n);
      if(n) m.push(n);
      return m;
    },[]);
  },

  findGroups: function() {
    var size = this.size();

    // clear visited
    this.board.each(function(f) {f.visited = false;});

    var groups = [];
    
    var self = this;
    var followGroup = function(f,g) {

      if(f) {
        if(f.isColor() && !f.visited) {
          color = f.state(); 
          if(g.length > 0) {
            if(g[0].state() != color) return;
          }
          g.push(f);
          //g.push({point:[i,j],color:color});
          f.visited = true;

          _.each(self.neighborhood(f),function(n) {
            followGroup(n,g);
          });
        }
     }
    };

    this.board.each(function(f) {
      g = [];
        followGroup(f,g);
        if(g.length>0) groups.push(g);
    });
    return groups;
  }, 

  deadGroups: function() {

    var liberties = function(g) {
      var lf = [];
    }
    var groups = this.findGroups();

    var dead = _.filter(groups,function(g) { liberties(g) == 0;});
  }
});

var FieldView = Backbone.View.extend({

  colors: {1: "#000000", 2: "#ffffff"},

  currentColor: function() {
    var player = this.boardModel.nextPlayer();
    return this.colors[player];
  },

  initialize: function() {

    _.extend(this,this.options);
    this.stone = jc.circle(this.x,this.y,this.radius,"rgba(0,0,0,0.0)",true).level('5');

    // TODO make this more pretty, anstract rendering
    var self = this;
    this.model.bind("change", function() {
      console.log("played at: "+self.model.id);
      if(self.model.isColor()) {
        var color = self.colors[self.model.state()];
        self.stone.color(color);
        self.stone.opacity(1.0);
      } 
      else if(self.model.isFree()) {
        self.stone.opacity(0.0);
      }
    });

    // bind jcanvascript events
    // install mouse event handlers for stones
    this.stone.mouseover(function(p) {
      if(self.model.isFree()) {
        this.color(self.currentColor());
        this.opacity(0.5);
      }
    });

    
    this.stone.mouseout(function(p) {
      if(self.model.isFree()) {
        this.opacity(0.0);
      }
    });

    this.stone.click(function(p) {
      if(self.model.isFree()) {
        self.boardModel.playMove(self.model);
      }

    });
  }

});

var GoBoardView = Backbone.View.extend({

  id: "go-board",

  width: 800,
  border: 30,
  radius: 20,

  initialize: function() {

    var size = this.model.size();
    this.spacing = spacing = (this.width-2*this.border)/(size-1);

    this._FieldViews = [];
    
    this.initBoard();
    this.initFields();
  },

  initFields: function() {
    jc.start(this.id,true);
    var self = this;
    this.model.board.each(function(f) {
      var p = self.indexToPoint(f.id);
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
      // draw hoshis
    }
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

var ControlView = Backbone.View.extend({

  el: "#game .control",

  events: {
    "click .button.clear" : "clear"
  },

  template: _.template("<b>Current Player: </b> <%=player%>"),

  initialize: function() {
    this.model.bind('change',this.render,this);
  },

  clear: function() {
    this.model.clear();
  },

  render: function() {
    $(this.el).html(this.template(this.model.nextPlayerJSON()));
    return this;
  }

});

var App = Backbone.View.extend({
  el: "#game",
  initialize: function() {
    console.log(this.el);
    this.boardModel = new GoBoardModel();
    this.boardView = new GoBoardView({model: this.boardModel});
    this.controlView = new ControlView({model:this.boardModel});
  }

});

var start = function() {
  console.log("Initilize App");
  window.app = new App;
};
