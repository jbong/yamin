/**
 * socket writing abstraction
 *
 * @constructor
 */
function SocketWriter() {
    this.writeDocument = function(connection) {
        return function(messageId, doc) {
            connection.write(JSON.stringify({id : 'yamin:server:' + messageId, payload : doc}));
        }
    };

    this.write = function(connection) {
        return function(messageId, doc) {
            connection.write(JSON.stringify({id : 'yamin:server:' + messageId, payload : doc}));
        }
    };
}

exports.SocketWriter = SocketWriter;