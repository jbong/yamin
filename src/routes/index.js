module.exports = exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index');
    });
};
