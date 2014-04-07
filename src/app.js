var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var swig = require('swig');
var sockjs = require('sockjs');
var sockServer = sockjs.createServer();
var app = express();

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

var SocketDispatch = require('./lib/handler/socket/dispatch').SocketDispatch;
var SocketHandler = require('./lib/handler/socket/handler').SocketHandler;
var SocketRouter = require('./lib/handler/socket/router').SocketRouter;
var SocketWriter = require('./lib/handler/socket/writer').SocketWriter;
var MongoDBHandler = require('./lib/mongo/mongo-db').MongoDB;

var mongodbHandler = new MongoDBHandler();
var socketWriter = new SocketWriter();
var socketDispatch = new SocketDispatch(sockServer);
var socketHandler = new SocketHandler(mongodbHandler, socketWriter);
var socketRouter = new SocketRouter(socketDispatch, socketHandler);

// all environments
app.engine('html', swig.renderFile);
app.set('port', process.env.PORT || 8120);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('i like turtles'));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
    swig.setDefaults({ cache: false });
}

routes(app);

socketRouter.init();
socketDispatch.init();

var server = http.createServer(app);
sockServer.installHandlers(server, {prefix:'/yaminsock'});


server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


