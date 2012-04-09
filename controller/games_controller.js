module.exports.load = function(gameStore) {

  return {

    index: function(req,res,next) {
      res.send(404);
    },

    show: function(req,res,next) {
      gameStore.readGame(req.params.id,function(err,ret) {
        if(err || !ret) { 
          res.send(404);
        } else {
          req.game = ret;
          next();
        }
      });
    },
    
    create: function(req,res) {
      console.log("request: "+JSON.stringify(req.body));
      gameStore.createGame(function(err,ret) {
        if(err) throw err;
        res.send({id:ret});
      });
    },

    update: function(req,res) {
      res.send(500);
    }

  };
};
