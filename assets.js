var piler        = require('piler'),
    fs           = require('fs'),
    path         = require('path'),
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

  _.each(files,function(f) {
    var filePath = path.join(directory,f);
    var stats = fs.lstatSync(filePath);
    var cond = true;
    if(filter && _.isFunction(filter)) cond = filter(f);
    if(filter && _.isRegExp(filter)) cond = filter.test(f);
    if(cond && stats.isFile()) cb(filePath)
    if(stats.isDirectory()) func(filePath,cb,filter);
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
        handler.addFile(f)
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
    opts.io = opts.io || config.io;
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
  
  jsHandler.bind(app);
  cssHandler.bind(app);

  if(options.io) {
    jsHandler.addUrl('/socket.io/socket.io.js');
  }

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
      var templateSrc = hbsPrecompiler.do({
        templates: [templateDir],
        fileRegex: hbsRegex,
        min:false 
      });

      jsHandler.addRaw(templateSrc);

      

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
