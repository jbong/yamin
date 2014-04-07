var util = require("util");
var events = require("events");

/**
 * a socket event dispatcher
 *
 * @param socketServer
 * @constructor
 */
function SocketDispatch(socketServer) {
    events.EventEmitter.call(this);

    this.socketServer = socketServer;
}

util.inherits(SocketDispatch, events.EventEmitter);

/**
 * handle connections and emit
 */
SocketDispatch.prototype.init = function() {
    var that = this;

    this.socketServer.on('connection', function(conn) {
        conn.on('data', function(message) {
            try {
                var data = JSON.parse(message);

                if(data.id) {
                    that.emit('message', conn, data);
                }
            } catch (e) {console.log(e)}
        });

        conn.on('close', function() {
            that.emit('closed', conn);
        });

        that.emit('connection', conn);
    });
};


exports.SocketDispatch = SocketDispatch;