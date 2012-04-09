(function() {

  var Utils;
  // export module

  Utils = this.Utils = {};

  // general purpose router
  Utils.Router = function(options) {
    options || (options = {});
    this.handlers = [];
    this.initialize.apply(this,arguments);

    // implement event handler to process
    // routing events
    this.bind('all', this.delegate);
  };


  // set up a router for testing purpose
  Utils.TestRouter = function(obj) {
    var Router = Utils.Router.extend(obj);
    var router = new Router;
    router.route("query/:name/:id","query", function(name,id) {console.log("query "+[name,id]);});
    return router;
  };

  var namedParams = /:\w+/g;

  // extend Routers prototype
  _.extend(Utils.Router.prototype, Backbone.Events, {

    initialize: function()  {},

    /* add a new router like this:
     *
     *  router.route("query/:name/:id","query", function(name,id) {console.log("query "+[name,id]);});
     */
    route: function(route,name,callback) {
      if(!callback) {
       callback = this[name];
      };
      route = this._routeToRegExp(route);
      callback && this.handlers.push({route:route,callback:callback});
    },


    // proces incomming route-request and delegate them to 
    // the router handler 
    delegate: function(fragment) {
      console.log(this.handlers);
      var matched = _.any(this.handlers, function(handler) {
        if(handler.route.test(fragment)) {
          var args = this._extractParameters(handler.route,fragment);
          handler.callback.apply(this,args);
          return true;
        }
      },this);
      return matched;
    },

    // create regexp from route string
    _routeToRegExp: function(route) {
      route = route.replace(namedParams,'([^\/]*)');
      return new RegExp('^'+route+'$');
    },

    // given URL regexp and fragment, return  array of 
    // extracted parameters
    _extractParameters: function(route,fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // self propagate extend function
  var extend = function(protoProps) {
    var child = inherits(this,protoProps);
    child.extend = this.extend;
    return child;
  };

  Utils.Router.extend = extend;

  // empty ctor function as ctor prototype
  var ctor = function() {};

  var inherits = function(parent, protoProps) {

    var child;

    if(protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function() {parent.apply(this,arguments);};
    }

    // inherit from parent
    _.extend(child,parent);

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // set prototype properties
    if(protoProps) _.extend(child.prototype,protoProps);

    // set correct ctor
    child.prototype.constructor = child;

    return child;

  };


}).call();
