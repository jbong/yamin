/**
 * a socket router
 *
 * @param dispatch
 * @param handler
 * @constructor
 */
function SocketRouter(dispatch, handler) {
    this.dispatch = dispatch;
    this.handler = handler;
}
/**
 * wire up dispatch to handler events
 */
SocketRouter.prototype.init = function() {

    var that = this;

    this.dispatch.on('connection', function(connection) {
        that.handler.newConnection.call(that.handler, connection);
    });

    this.dispatch.on('closed', function(connection) {
        that.handler.closed.call(that.handler, connection);
    });

    this.dispatch.on('message', function(connection, data) {

        var id = data.id.split(':')[2];

        if(that.handler[id]) {
            that.handler[id].call(that.handler, connection, data.payload);
        }
    });
};

exports.SocketRouter = SocketRouter;