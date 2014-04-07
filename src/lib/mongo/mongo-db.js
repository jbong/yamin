

var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;


/**
 * a mongo db cmd wrapper
 *
 * @constructor
 */
function MongoDB() {

    /**
     * try connect to the server
     *
     * @param server
     * @param port
     * @param db
     * @param cb
     * @private
     */
    this._connect = function(server, port, db, cb) {
        MongoClient.connect('mongodb://' + server + ':' + port + (db == null ? '' : '/' + db), {native_parser:true}, function(err, db) {
            cb(err, db);
        })
    };
    /**
     * connect and fetch db list
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.connect = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, null, function(err, db) {
            if(err) {
                writer('connectServer', {ok : false, err : err.message});
            } else {
                db.admin().listDatabases(function(err, dbs) {
                    db.admin().serverStatus(function(err, info) {
                        writer('connectServer', {ok : true, databases : dbs.databases, info : info, server : payload.server, port : payload.port});
                        db.close();
                    })
                });
            }
        });
    };
    /**
     * get admin() serverstatus
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.serverStatus = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, null, function(err, db) {
            if(err) {
                writer('serverAdminCmd', {ok : false, err : err.message});
            } else {
                db.admin().serverStatus(function(err, info) {
                    writer('serverAdminCmd', {ok : true, response : info, server : payload.server, port : payload.port});
                    db.close();
                });
            }
        });
    };
    /**
     * get admin() buildInfo
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.buildInfo = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, null, function(err, db) {
            if(err) {
                writer('serverAdminCmd', {ok : false, err : err.message});
            } else {
                db.admin().buildInfo(function(err, info) {
                    writer('serverAdminCmd', {ok : true, response : info, server : payload.server, port : payload.port});
                    db.close();
                });
            }
        });
    };
    /**
     * get admin() profiling level
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.profilingLevel = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, null, function(err, db) {
            if(err) {
                writer('serverAdminCmd', {ok : false, err : err.message});
            } else {
                db.admin().profilingLevel(function(err, info) {
                    writer('serverAdminCmd', {ok : true, response : info, server : payload.server, port : payload.port});
                    db.close();
                });
            }
        });
    };
    /**
     * get admin() ping
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.ping = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, null, function(err, db) {
            if(err) {
                writer('serverAdminCmd', {ok : false, err : err.message});
            } else {
                db.admin().ping(null, function(err, info) {
                    writer('serverAdminCmd', {ok : true, response : info, server : payload.server, port : payload.port});
                    db.close();
                });
            }
        });
    };
    /**
     * run a find
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.find = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, payload.db, function(err, db) {
            if(err) {
                writer('serverReadCmd', {ok : false, err : err.message});
            } else {
                db.collection(payload.collection, null, function(err, collection) {
                    var stream = collection.find(payload.query, payload.options).stream();
                    stream.on('error', function(err) {  cb (err) });
                    stream.on('close', function() {
                        db.close();
                        cb(null);
                    });
                    stream.on('data', function(data) {
                        writer('serverReadCmd', data);
                    });
                });
            }
        });
    };
    /**
     * run a findOne
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.findOne = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, payload.db, function(err, db) {
            if(err) {
                writer('serverReadCmd', {ok : false, err : err.message});
            } else {
                db.collection(payload.collection, null, function(err, collection) {
                    collection.findOne(payload.query, payload.options, function(err, doc) {
                        writer('serverReadCmd', doc);
                    });
                });
            }
        });
    };
    /**
     * list collections
     *
     * @param payload
     * @param writer
     * @param cb
     */
    this.collections = function(payload, writer, cb) {
        this._connect(payload.server, payload.port, payload.db, function(err, db) {
            db.collections(function(err, collections) {
                var names = [];
                for(var i=0; i<collections.length; i++) {
                    names.push({name : collections[i].collectionName});
                }
                writer('collections', {ok : true , db : payload.db, collections : names});
                db.close();
            });
        });
    };
}

exports.MongoDB = MongoDB;