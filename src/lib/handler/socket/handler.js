/**
 * socket request handler
 *
 * @param mongodb
 * @param writer
 * @constructor
 */
function SocketHandler(mongodb, writer) {
    this.mongodb = mongodb;
    this.writer = writer;
}
/**
 * handle a connectServer request
 *
 * @param connection
 * @param payload
 */
SocketHandler.prototype.connectServer = function(connection, payload) {
    this.mongodb.connect(payload, this.writer.writeDocument(connection), function(err) {})
};
/**
 * handle request for collection names
 *
 * @param connection
 * @param payload
 */
SocketHandler.prototype.collections = function(connection, payload) {
    this.mongodb.collections(payload, this.writer.write(connection), function(err) {})
};
/**
 * new client
 *
 * @param connection
 */
SocketHandler.prototype.newConnection = function(connection) {};
/**
 * handle a server admin request
 *
 * @param connection
 * @param payload
 */
SocketHandler.prototype.serverAdmin = function(connection, payload) {

    switch(payload.cmd) {
        case 'serverStatus':
            this.mongodb.serverStatus(payload, this.writer.write(connection), function(err) {});
            break;
        case 'buildInfo':
            this.mongodb.buildInfo(payload, this.writer.write(connection), function(err) {});
            break;
        case 'profilingLevel':
            this.mongodb.profilingLevel(payload, this.writer.write(connection), function(err) {});
            break;
        case 'ping':
            this.mongodb.ping(payload, this.writer.write(connection), function(err) {});
            break;
    }
};
/**
 * handle a server read request
 *
 * @param connection
 * @param payload
 */
SocketHandler.prototype.serverRead = function(connection, payload) {

    switch(payload.cmd) {
        case 'find':
            this.mongodb.find(payload, this.writer.write(connection), function(err) {});
            break;
        case 'findOne':
            this.mongodb.findOne(payload, this.writer.write(connection), function(err) {});
            break;
    }
};
/**
 * client dc'd
 *
 * @param connection
 */
SocketHandler.prototype.closed = function(connection) {};

exports.SocketHandler = SocketHandler;