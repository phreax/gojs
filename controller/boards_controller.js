module.exports.load = function(gameStore) {

  return {
    index: function(req,res) {
      res.send(404);
    },

    show: function(req,res,next) {
      gameStore.readBoard(req.params.id,function(err,ret) {
        if(err || !ret) { 
          res.send(404);
        } else {
          req.board = ret;
          next();
        }
      });
    },

    create: function(req,res) {
      res.send(500);
    },

    update: function(req,res,next) {
      gameStore.saveBoard(req.params.id,req.body,function(err,ret) {
        if(err || !ret) { 
          res.send(500);
        } else {
          next();
        }
      });
    }
  };
};
