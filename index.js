var express = require('express');
var request = require('request');
var math = require('mathjs');
var bodyParser = require('body-parser');

var handlers = require('./lib/handlers');

var app = express();

app.set('port', (process.env.PORT || 8080));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(app.get('port'), function () {
  console.log('app starting at port '+ app.get('port'));
  
  var appName = process.env.APP_NAME;
  if(appName)
    setInterval(function () {
      console.log('ping every 20 minutes');
  	  request.get('http://' + appName + '.herokuapp.com/ping');
    }, 20 * 60 * 1000);

});

app.get('/eval', handlers.evalGet);
app.post('/eval', handlers.evalPost);

app.get('/scope/read', handlers.scopeReadGet);

app.get('/ping', function(req, resp) {
  resp.send('pong');
});
