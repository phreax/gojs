module.exports.load = function(gameStore) {
  
  return {
  
    index: function(req,res,next) {
      console.log('index fields');
      gameStore.readAllFields(req.params.id,function(err,ret) {
        if(err || !ret) { 
          res.send(404);
        } else {
          req.fields = ret;
          next();
        }
      });
    },

    show: function(req,res,next) {
      gameStore.readField(req.params.id,req.params.fid,function(err,ret) {
        if(err || !ret) { 
          res.send(404);
        } else {
          req.field = ret;
          next();
        }
      });
    },

    create: function(req,res) {
      res.send(500);
    },

    update: function(req,res,next) {
      gameStore.saveField(req.params.id,req.body,function(err,ret) {
        console.log("save field "+err);
        if(err) { 
          res.send(500);
        } else {
          next();
        }
      });
    }
  };
};

