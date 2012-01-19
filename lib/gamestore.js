// redis store for game data
//
var redis = require('redis');

var GameStore = function(prefix) {
  this.prefix = prefix || 'gamestore';
  this.client = redis.createClient();
};

GameStore.prototype = {
  
  key: function() {
    var args = Array.prototype.slice.call(arguments);
    return args.join(':');
  },

  createGame: function(cb) {
    var attr = {},
        client = this.client,
        prefix = this.prefix,
        key    = this.key;
        
    attr.nplayers = 0;

    // get new id
    client.incr(key(prefix,'next','games'),function(err,id) {
      if(err) {
        cb(err,id);
      } else {
        // save key index
        client.sadd(key(prefix,'keys','games'),id);
        
        // save attributes
        client.hmset(key(prefix,'games',id), attr,function(err,ret) {
          if(err) {
            cb(err,ret);
          } else {
            cb(null,id);
          }
        });

      }
    });
  },

  readGame: function(gameID,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;

    client.hgetall(key(prefix,'games',gameID),cb);
  },

  addPlayer: function(gameID,sessionID,cb) {

    var client = this.client,
        prefix = this.prefix,
        key    = this.key;

    cb = cb || function() {};

    // todo: one could determin whether key exists in keys:games
    client.hgetall(key(prefix,'games',gameID),function(err,data) {
      if(err || !data.nplayers ) {
        cb("Could not retrieve game object",null);
      } else {
        if(data.nplayers >=2 ) {
          cb("Enough players",data);
          return;
        }

        if(data.nplayers == 0) {
          data.player1 = sessionID;
          data.nplayers=1;
        }

        else if(data.nplayers == 1) {
          data.player2 = sessionID;
          data.nplayers=2;
        }
        
        console.log('save data');
        // save data
        client.hmset(key(prefix,'games',gameID),data,cb);

      }

    });
    
  },

  saveBoard: function(gameID,model,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;

    client.exists(key(prefix,'games',gameID), function(err,ret) {
      if(err || ret==0) {
        cb("game id not found",ret);
      } else {
        client.hmset(key(prefix,'games',gameID,'boardModel'),model,cb);
      }
    });
    
  },
  
  saveField: function(gameID,model,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;
        
      client.exists(key(prefix,'games',gameID),function(err,ret) {
      if(err || ret==0) {
        cb("game id not found",ret);
      } else {
        var id = model.id;
        client.hmset(key(prefix,'games',gameID,'fields',id),model);

        // save key to 
        client.sadd(key(prefix,'keys','games',gameID,'fields'),id,cb);
      }
    });
  },
  
  readBoard: function(gameID,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;

    client.exists(key(prefix,'games',gameID), function(err,ret) {
      if(err || ret==0) {
        cb("game id not found",ret);
      } else {
        client.hgetall(key(prefix,'games',gameID,'boardModel'),cb);
      }
    });
    
  },
  
  readField: function(gameID,id,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;
        
    client.exists(key(prefix,'games',gameID),function(err,ret) {
        
      if(err || ret==0) {
        cb("game id not found",ret);
      } else {
        client.hgetall(key(prefix,'games',gameID,'fields',id),cb);
      }
    });
  },

  saveAllFields: function(gameID,collection,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;
    client.exists(key(prefix,'games',gameID),function(err,ret) {
     
      if(err || ret==0) {
        cb("game id not found",ret);
      } else {
        var count=0;

        collection.forEach(function(model) {
          var id = model.id;
          client.hmset(key(prefix,'games',gameID,'fields',id),model, function(err,ret) {
            if(err) {
              cb(err,ret);
            } else {
              count++;
              client.sadd(key(prefix,'keys','games',gameID,'fields'),id);

              // callback when written all models
              if(count>=collection.length) {
                cb(null,count);
              }
            }
          });
        });
      }
    });
  },

  readAllFields: function(gameID,cb) {
    
    var client = this.client,
        prefix = this.prefix,
        key    = this.key;
        
    client.exists(key(prefix,'games',gameID),function(err,ret) {
     
      if(err || ret==0) {
        cb("game id not found",ret);
      } else {
        var collection = [];
        client.smembers(key(prefix,'keys','games',gameID,'fields'),function(err,keys) {
          if(err) {
            cb(err,keys);
          } else {
            keys.forEach(function(id) {
              client.hgetall(key(prefix,'games',gameID,'fields',id),function(err,model) {
                if(err) {
                  cb(err,ret);
                } else {
                  model.id = parseInt(model.id);
                  collection.push(model);
                  // callback when all models are read
                  if(collection.length == keys.length) {
                    cb(null,collection);
                  }
                }
              });
            });
          }
        });
      }
    });
  }

};

module.exports = GameStore;

