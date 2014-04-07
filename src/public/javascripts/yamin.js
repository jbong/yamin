yamin = window.yamin || {};

(function(yamin, YUI) {

    yamin.connection = {
        server : null,
        port : null,
        db : null,
        collection : null
    };

    yamin.socket = (function(yamin) {

        var _sock = new SockJS('/yaminsock');

        _sock.onopen = function() {
            yamin.sockOpen();
        };

        _sock.onmessage = function(e) {
            yamin.sockMessage(JSON.parse(e.data));
        };

        _sock.onclose = function() {
            yamin.sockClose();
        };

        return {
            write : function(id, payload) {
                _sock.send(JSON.stringify({id : 'yamin:client:' + id, payload : payload}));
            }
        }

    }(yamin));

    yamin.sockOpen = function() {
    };

    yamin.sockClose = function() {
    };

    yamin.sockMessage = function(data) {
        var id = data.id.split(':')[2];
        if(yamin[id + 'Response']) {
            yamin[id + 'Response'](data.payload);
        }
    };

    yamin.serverAdminCmdRequest = function(cmd) {
        yamin.socket.write('serverAdmin', {server : yamin.connection.server, port : yamin.connection.port, cmd : cmd});
    };

    yamin.serverReadCmdRequest = function(cmd, query, options) {
        yamin.socket.write('serverRead',
            {
                server : yamin.connection.server,
                port : yamin.connection.port,
                cmd : cmd,
                db : yamin.connection.db,
                collection : yamin.connection.collection,
                query : query,
                options : options
            }
        );
    };

    YUI().use('node', 'event', 'event-hover', 'json-parse', function(Y) {

        yamin.serverReadCmdResponse = function(payload) {
            var containerNode = Y.one('#readCmdResponse');
            var cNode = Y.Node.create('<div class="cb-box separate-result"><code><pre>' + JSON.stringify(payload, null, 4) +'</pre></code></div>');
            containerNode.appendChild(cNode);
        };

        yamin.serverAdminCmdResponse = function(payload) {
            Y.one('#serverAdminCmdResponse').setHTML('<div class="code-container"><code><pre>' + JSON.stringify(payload.response, null, 4) + '</pre></code></div>');
        };

        yamin.refreshCollections = function(db) {
            yamin.socket.write('collections', {server : yamin.connection.server, port : yamin.connection.port, db : db});
        };

        yamin.updateConnectionDisplay = function() {
            Y.one('#selectedContainer').set('text', JSON.stringify({ database : yamin.connection.db, collection : yamin.connection.collection }));
        };

        yamin.collectionsResponse = function(payload) {
            var containerNode = Y.one('#collectionContainer');
            containerNode.all('> *').remove();

            if(payload.collections.length == 0) {
                Y.one('#collectionListMenu').setStyle('display', 'none');
            } else {
                Y.one('#collectionListMenu').setStyle('display', 'block');
                for(var cIdx = 0; cIdx < payload.collections.length; cIdx++) {

                    var cNode = Y.Node.create('<li><a href="#">'+ payload.collections[cIdx].name+'</a></li>');
                    cNode.on('hover',
                        function(e) {
                            this.addClass('cursor-pointer');
                        },
                        function(e) {
                            this.removeClass('cursor-pointer')
                        }
                    );

                    (function(node, id){
                        node.on('click', function(e) {

                            yamin.connection.collection = id;
                            yamin.updateConnectionDisplay();

                            e.preventDefault();
                            e.stopPropagation();
                        });

                    }(cNode, payload.collections[cIdx].name));
                    containerNode.appendChild(cNode);
                }
            }
        };

        yamin.connectServerResponse = function(payload) {
            yamin.connection.server = payload.server;
            yamin.connection.port = payload.port;

            if(!payload.ok) {
                Y.one('#splashContent').setStyle('display', 'block');
                Y.one('#page-content').setStyle('display', 'none');
                Y.one('#splashContent').setHTML('<code><pre>' + JSON.stringify({error : payload.err}, null, 4) + '</pre></code>');
            } else {
                Y.one('#splashContent').setStyle('display', 'none');
                Y.one('#page-content').setStyle('display', 'block');

                var menuItems = Y.all('#main-menu li');
                menuItems.removeClass('pure-menu-selected');
                menuItems.removeClass('menu-selected');
                menuItems.filter('[data-view="serverView"]').addClass('pure-menu-selected menu-selected');

                Y.all('#view-content div.view-content').setStyle('display', 'none');
                Y.one('#serverView').setStyle('display', 'block');

                Y.all('#serverCmdMenu li').removeClass('sub-view-menu-selected');
                Y.all('#serverCmdMenu li').removeClass('pure-menu-selected');

                Y.one('#serverCmdMenu li[data-cmd="serverStatus"]').addClass('sub-view-menu-selected pure-menu-selected');
                yamin.serverAdminCmdRequest('serverStatus');

                var containerNode = Y.one('#databaseList');
                containerNode.all('> *').remove();

                for(var dbIdx = 0; dbIdx < payload.databases.length; dbIdx++) {

                    var dbNode = Y.Node.create('<li><a href="#">'+ payload.databases[dbIdx].name+'</a></li>');

                    dbNode.on('hover',
                        function(e) {
                            this.addClass('cursor-pointer');
                        },
                        function(e) {
                            this.removeClass('cursor-pointer')
                        }
                    );

                    (function(node, id){
                        node.on('click', function(e) {

                            yamin.connection.db = id;
                            yamin.connection.collection = null;
                            yamin.refreshCollections(id);

                            yamin.updateConnectionDisplay();

                            e.preventDefault();
                            e.stopPropagation();
                        });

                    }(dbNode, payload.databases[dbIdx].name));

                    containerNode.appendChild(dbNode);
                }

            }
        };

        Y.one('#btnConnect').on('click', function(e) {

            var serverName = Y.one('#serverName').get('value') || 'localhost';
            var serverPort = Y.one('#serverPort').get('value') || 27017;

            yamin.socket.write('connectServer', {server : serverName, port : serverPort});

            e.preventDefault();
            e.stopPropagation();
        });

        var menuItems = Y.all('#main-menu li');
        var dataViews = Y.all('#view-content div.view-content');

        Y.one('#main-menu').delegate('click', function(e) {

            menuItems.removeClass('pure-menu-selected');
            menuItems.removeClass('menu-selected');

            e.currentTarget.addClass('pure-menu-selected menu-selected');

            dataViews.setStyle('display', 'none');
            var dataView =  e.currentTarget.getAttribute('data-view');

            dataViews.filter('#' + dataView).setStyle('display', 'block');

            if(e.currentTarget.getAttribute('data-sub-view')) {
                Y.all('#' + e.currentTarget.getAttribute('data-view') + ' .sub-view-pane').setStyle('display', 'none');
                Y.one('#' + e.currentTarget.getAttribute('data-view') + ' #' + e.currentTarget.getAttribute('data-sub-view')).setStyle('display', 'block');
            }

            e.preventDefault();
            e.stopPropagation();
        }, 'li');


        Y.one('#serverCmdMenu').delegate('click', function(e) {
            Y.all('#serverCmdMenu li').removeClass('sub-view-menu-selected');
            Y.all('#serverCmdMenu li').removeClass('pure-menu-selected');
            e.currentTarget.addClass('sub-view-menu-selected');
            e.currentTarget.addClass('pure-menu-selected');

            yamin.serverAdminCmdRequest(e.currentTarget.getAttribute('data-cmd'));

            e.preventDefault();
            e.stopPropagation();
        }, 'li');

        Y.one('#readCmdButtons').delegate('click', function(e) {

            var query = Y.one('#readQuery').get('value') || '',
                queryObj = null;
            query = query.replace(/[\n\r]/g, '');

            var options = Y.one('#readOptions').get('value') || '',
                optionsObj = null;
            options = options.replace(/[\n\r]/g, '');

            var containerNode = Y.one('#readCmdResponse');
            containerNode.all('> *').remove();


            if(!yamin.connection.db || !yamin.connection.collection) {
                containerNode.appendChild(Y.Node.create('<div class="cb-box separate-result"><code><pre>'+ JSON.stringify({ error : "undefined db/collection"}, null, 4) + '</pre></code></div>'));
            } else {
                try {
                    queryObj = Y.JSON.parse(query);

                    try {
                        optionsObj = Y.JSON.parse(options);
                        yamin.serverReadCmdRequest(e.currentTarget.getAttribute('data-cmd'), queryObj, optionsObj);
                    } catch (e) {
                        containerNode.appendChild(Y.Node.create('<div class="cb-box separate-result"><code><pre>'+ JSON.stringify({ error : e.message}, null, 4) + '</pre></code></div>'));
                    }
                } catch (e) {
                    containerNode.appendChild(Y.Node.create('<div class="cb-box separate-result"><code><pre>'+ JSON.stringify({ error : e.message}, null, 4) + '</pre></code></div>'));
                }
            }
            e.preventDefault();
            e.stopPropagation();
        }, 'button');
    });
}(yamin, YUI));