var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/api/users', function (req, res) {
    res.send('GET');
});

app.post('/api/users', function (req, res) {
    res.send('POST');
});

app.use(express.static(__dirname + "/dist"));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});




if (app.get('env') === 'development') {
    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
}
else {
    app.listen(8080, function () {
        console.log('Example app listening on port 8080!');
    });
}


module.exports = app;