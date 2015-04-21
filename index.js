var express = require('express');
var math = require('mathjs');
var bodyParser = require('body-parser');

var handlers = require('./lib/handlers');

var app = express();

app.set('port', (process.env.PORT || 8080));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(app.get('port'), function () {
  console.log('app starting at port '+ app.get('port'));
});

var mathParser = new math.parser();

app.get('/eval', handlers.evalGet);
app.post('/eval', handlers.evalPost);
