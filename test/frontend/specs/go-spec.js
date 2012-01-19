// testing GoBoardModel
//

describe('A Go Board', function() {
  var boardModel = new GoBoardModel();

  var playStones = function(stones,color) {_.each(stones, function(s){s.setState(color);});} 
  
  beforeEach(function() {
    boardModel.clear();
  });

  describe('a single stone in the middle', function() {
    var stone = boardModel.fieldAt(10,10);
    playStones([stone]);

    var libs = boardModel.liberties([stone]);

    it('should have 4 liberties', function() {
      expect(libs.length).toEqual(4);
    });

    it('the liberties should be the adjacent field', function() {
      var dirs = [-1,1,-19,19].sort();

      var adj = _.map(libs,function(f) {
        return stone.index() - f.index();
      });

      expect(_.isEqual(adj.sort(),dirs)).toBeTruthy();
    });
  
  });

  describe("a single stone in the corner", function() {
    var stone = boardModel.fieldAt(0,0);
    playStones([stone]);
    var libs = boardModel.liberties([stone]);
    
    it('should have 4 liberties', function() {
      expect(libs.length).toEqual(2);
    });
    
    it('the liberties should be the adjacent field', function() {
      var dirs = [1,19].sort();

      var adj = _.map(libs,function(f) {
        return f.index() - stone.index();
      });

      expect(_.isEqual(adj.sort(),dirs)).toBeTruthy();
    });

  });
  
  describe("a single stone at the border", function() {
    boardModel.clear();
    var stone = boardModel.fieldAt(1,0);
    playStones([stone]);
    var libs = boardModel.liberties([stone]);
    
    console.log("play at: "+stone.point());
    console.log("liberties:");
    _.map(libs,function(f){console.log(f.point())});
   
    it('should have 3 liberties', function() {
      expect(libs.length).toEqual(3);
    });
    
    it('the liberties should be the adjacent field', function() {
      var dirs = [1,-19,19].sort();

      var adj = _.map(libs,function(f) {
        return f.index() - stone.index();
      });

      expect(_.isEqual(adj.sort(),dirs)).toBeTruthy();
    });

  });

  describe("a row of 5 stones in the middle",function() {
    boardModel.clear();

    var stones = _.map(_.range(10,15), function(i) { return boardModel.fieldAt(10,i);});
    
    var libs = boardModel.liberties(stones);
    
    it("there should 5 black stones", function() {
    playStones(stones,1);
      var b = boardModel.board.filter(function(s) { return !s.isFree()});
      expect(b.length).toEqual(5);
    }),
    it("stone fields should be not free",function() {
    playStones(stones,1);
      var allOccupied = _.all(stones,function(s) {return !s.isFree();});
      expect(allOccupied).toBeTruthy();
    });

    it("all liberties should be free",function() {
    playStones(stones,1);
     
    var libs = boardModel.liberties(stones);
      var allFree = _.all(libs,function(s) {return s.isFree();});
      expect(allFree).toBeTruthy();

    });
    it("should have 2n+2 liberties", function() {
      playStones(stones,1);
    var libs = boardModel.liberties(stones);
      expect(2*stones.length+2).toEqual(libs.length);
    });

  });
});
