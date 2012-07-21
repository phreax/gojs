module.exports = 
  assets:
    dir: 'public'

    stylesheets: [
      (require: 'style.css')
    ]

    javascripts: [

      (require: 'vendor/jCanvaScript.1.5.18.js')
      (require: 'vendor/jquery-1.7.1.min.js')
      (require: 'vendor/underscore.js')
      (require: 'vendor/backbone.js')
      
      (require_tree: 'lib/models')
      (require_tree: 'lib/collections')
      (require_tree: 'lib/views')
      (require: 'lib/app.js')
    ]

    templates:
      dir: 'templates'
      engine: 'handlebars'
      lib: 'vendor/handlebars.runtime.js'
      watch: true
