var piler        = require('piler'),
    fs           = require('fs'),
    path         = require('path'),
    watch        = require('watch'),
    _            = require('underscore'),
    jsHandler = piler.createJSManager(),
    cssHandler = piler.createCSSManager();
    
var buildRegex = function(extensions) {
  extensions = extensions || [];
  return new RegExp('\.' + extensions.join('$|\.') + '$'); 
};

var walkDir  = function(directory,cb,filter) {

  var func = arguments.callee;
  var files = fs.readdirSync(directory);

  var wrapped = function(file,dir) {
    if(cb.length === 1 && file) cb(file);
    else if(cb.length >= 2) cb(file,dir);
  };

  _.each(files,function(f) {
    var filePath = path.join(directory,f);
    var stats = fs.lstatSync(filePath);
    var cond = true;

    if(filter && _.isFunction(filter)) cond = filter(f);
    if(filter && _.isRegExp(filter)) cond = filter.test(f);
    if(cond && stats.isFile()) wrapped(filePath,null);
    if(stats.isDirectory()) {
      wrapped(null,filePath);
      func(filePath,cb,filter);
    } 
  });
};

var clientUpdater = function() {
  console.log('Starting asset updater..');  

  var socket = io.connect('/assets');

  socket.on('connect', function() {
    console.log('Updated has connected');
  });
  
  socket.on('disconnect', function() {
    console.log('Updated has disconnected');
  });

  socket.on('update:js', function(source) {
    console.log('Updating javascipts');
    eval(source);
  });

};

var loadAssets = function(assets, handler, assetDir, extensions) {

  if(!assets) return;
  if(!_.isArray(assets)) {
    assets = [assets];
  }

  var fileRegex = buildRegex(extensions);

  _.each(assets, function(asset) {
    if(f = asset.require) {
      var filePath = path.join(assetDir,f);
      handler.addFile(filePath);
      
      console.log('Add File: '+filePath);
    }

    if(dir = asset.require_tree) {
      var requirePath = path.join(assetDir,dir);

      walkDir(requirePath,function(f) {
        console.log('Add File: '+f);
        handler.addFile(f);
      }, fileRegex);
      
    }
  });
};

var bind = function(app,options) {

  options = options || {};

  (function(opts) {
    try {
      opts.config = opts.config || require('./config');
    } catch(err) {
      console.warn('Could not load configuration file!');
    }
    opts.rootDir = opts.rootDir || __dirname;
    opts.assetDir = opts.assetDir || (opts.config.assets && opts.config.assets.dir);
    opts.assetDir = opts.assetDir || 'public';
  })(options);

  var config = options.config;
  
  if(!config) {
    console.warn('No configuration found!');
    return;
  }

  if(!config.assets) {
    console.warn('No assets specified in config!');
    return;
  }

  var io     = options.io;

  if(!io) {
    io = require('socket.io');
    io.listen(app);
  }

  var socket = io.of('/assets');
  var updateJS = function(source) {
    console.log('Hotpush javascript to client');
    socket.emit('update:js',source);
  };
        

  jsHandler.bind(app);
  cssHandler.bind(app);

  jsHandler.addUrl('/socket.io/socket.io.js');

  jsHandler.addExec(clientUpdater);

  if(config.assets.templates) {

    console.log('Compile templates');
    var engine =config.assets.templates.engine;
    var lib = config.assets.templates.lib;
    var templateDir = path.join(options.assetDir,config.assets.templates.dir || 'templates');

    loadAssets( lib
              , jsHandler
              , options.assetDir + '/javascripts'
              );

    if(engine == 'handlebars') {
      var hbsPrecompiler = require('handlebars-precompiler');

      var hbsRegex = buildRegex(['hbs','handlebars']); 
      var compile = function(file) {
         return hbsPrecompiler.do({
          templates: [file],
          fileRegex: hbsRegex,
          min:false 
        });
      };

      jsHandler.addRaw(compile(templateDir));

      
      if(config.assets.templates.watch) {

        var updateTemplate = function(file) {
          var source;
          try {
            source = compile(file);
            updateJS(source);
          } catch(err) {
            console.warn('Failed to compile template ' + file);
            console.warn(err);
          }
        };

        watch.createMonitor(templateDir, function(monitor) {
          console.log('[start watching] ' +templateDir);
          monitor.on('changed', function(f, curr, prev) {
            if(hbsRegex.test(f)) {
              console.log('[changed file] '+ f);
              updateTemplate(f);
            }
          });
          monitor.on('created', function(f, curr, prev) {
            if(hbsRegex.test(f)) {
              console.log('[created file] '+ f);
              updateTemplate(f);
            }
          });
        });
      }

    }
    else {
      console.warn('Template engine '+ engine + ' not supported!');
    }
  }
  
  if(config.assets.javascripts) {
    loadAssets( config.assets.javascripts
              , jsHandler
              , options.assetDir + '/javascripts'
              , ['js','coffee']
              );
  }

  if(config.assets.stylesheets) {
    loadAssets( config.assets.javascripts
              , jsHandler
              , options.assetDir + '/stylesheets'
              , ['css','less']
              );
  }

};

module.exports = {
  bind: bind,
  jsHandler: jsHandler,
  cssHandler: cssHandler
};



