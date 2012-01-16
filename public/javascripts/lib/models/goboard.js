var GoBoardModel = Backbone.Model.extend({
  
  defaults: {
    "nextPlayer":"black", // black player
    "size":19
  },

  initialize: function() {
    this.fields = new Fields();
    
    var size = this.size();
    var idx= 0;
    for(i in _.range(size)) 
    for(j in _.range(size)) {
      idx = size*i+1*j;
      this.fields.add({point:[i,j],id:idx});
      idx++;
    }

  },
  
  size: function() {return this.get('size');},
  nextPlayer: function() {return this.get('nextPlayer');},

  // return a field model by coord, if exist, else undefined
  fieldAt: function(i,j) {
    var size = this.size()
    if(i<0||i>=size||j<0||j>=size) return undefined;
    return this.fields.at(i*size+j);
  },

  playMove: function(field,color) {
    color = color || this.nextPlayer();
    field.setState(color);
   
    nextcolor = color == "white"? "black": "white"; 

    // find dead groups and delete them
    var dead = this.deadGroups(nextcolor);
    _.each(dead,this.deleteGroup,this);

    console.log("played at "+field.point() );
    var f = this.fieldAt(0,1);
    console.log(f);
    var self = this;
    _.map(this.liberties([f]),function(f){console.log(f.point());});

    // toggle player
    this.setPlayer(nextcolor);
        
  },

  setPlayer: function(player) {
    this.set({nextPlayer:player});
  },

  // clear whole fields
  clear: function() {
    this.fields.each(function(field) {
      field.clear();
    });
  },

  // delete a group of stones
  deleteGroup: function(g) {
    _.each(g,function(s){s.clear()});
  },
  
  //go logic
  //
  neighborhood: function(f) {
    var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    var size = this.size();
 
    var p = f.point();
    
    return _.reduce(dirs,function(m,d) {
      n = this.fieldAt(p[0]+d[0],p[1]+d[1]);
      if(n) m.push(n);
      return m;
    },[],this);
  },

  findGroups: function(color) {
    var size = this.size();

    // clear visited
    this.fields.each(function(f) {f.visited = false;});

    var groups = [];
    
    var self = this;

    // returns true if color matches, only if color is defined
    var validColor = function(f,c) {
      if(!color) return true;
      return c == f.state();
    };

    // simple recursive tracking algorithm
    var followGroup = function(f,g) {

      if(f) {
        if(f.isColor() && !f.visited && validColor(f,color)) {
          currcolor = f.state(); 
          if(g.length > 0) {
            if(g[0].state() != currcolor) return;
          }
          g.push(f);
          f.visited = true;

          _.each(self.neighborhood(f),function(n) {
            followGroup(n,g);
          });
        }
     }
    };

    this.fields.each(function(f) {
      g = [];
      followGroup(f,g);
      if(g.length>0) groups.push(g);
    });
    return groups;
  }, 

  // find all liberties of a group
  liberties: function(g) {

    var libertyOne = _.bind(function(f) {
     return _.filter(this.neighborhood(f),function(n) {return n.isFree();});
    },this);

    return _.uniq(_.flatten(_.map(g,libertyOne)));

  },

  deadGroups: function(color) {

    var groups = this.findGroups(color);
    //console.log("groups:");
    _.each(groups,this.printGroups,this);

    var dead = _.filter(groups,function(g) { return this.liberties(g).length == 0;},this);
    //console.log("dead groups:")
    return dead;
  },

  // debug method
  printGroups: function(g) {
    var index = function(s) {return s.index();}
    var gjson = {color:g[0].state(), stones: _.map(g,index),liberties:this.liberties(g).length};
    console.log(JSON.stringify(gjson));
  }

});

