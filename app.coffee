#
# Module dependencies.
#

express      = require 'express'
parseCookie  = require('connect').utils.parseCookie
io           = require 'socket.io'
GameStore    = require './lib/gamestore'
acid         = require 'acid'
app          = module.exports = express.createServer()
MemoryStore  = express.session.MemoryStore
sessionStore = new MemoryStore()
gameStore    = new GameStore()
config       = require './config'

# controller
games = require('./controller/games_controller').load gameStore 
fields = require('./controller/fields_controller').load gameStore 
boards = require('./controller/boards_controller').load gameStore 

assetdir = __dirname + '/public'

io       = io.listen app

# Configuration
app.configure ->

  app.set 'views', __dirname + '/views'
  app.set 'view engine', 'jade'
  app.use express.logger(format: ':method :url')
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser()
  app.use express.session(store: sessionStore, secret:"string",key: "express.sid")
  app.use app.router
  app.use express.static(assetdir)

  acid.bind app, {io:io,config:config}

  acid.liveUpdate()

app.configure 'development', ->
  app.use express.errorHandler( dumpExceptions: true, showStack: true )

app.configure 'production', ->
  app.use express.errorHandler()

# define REST api
app.get '/', (req, res) ->
  res.render 'index', 
    title: 'GoJS'

app.put '/games/:id/board/fields/:fid', fields.update, (req,res) -> 
  res.send 200

app.get '/games/:id/board/fields/:fid', fields.show, (req,res) -> 
  res.send req.field

app.get '/games/:id/board/fields', fields.index, (req,res) -> 
  res.send req.fields

app.put '/games/:id/board/fields', fields.update, (req,res) -> 
  res.send 200

app.put '/games/:id/board', boards.update, (req,res) -> 
  res.send 200

app.post '/games/:id/board', boards.create, (req,res) -> 
  res.send 200

app.get '/games/:id/board', boards.show, (req,res) -> 
  res.send req.board

app.get '/games/:id', games.show, (req,res) -> 
  res.send req.game

app.get '/games', games.index
app.post '/games', games.create

app.error (err,req,res,next) -> 
  console.log "error thrown #{err}"
  res.send 404

app.listen 3000
console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env
