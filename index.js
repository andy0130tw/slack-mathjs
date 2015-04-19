var express = require('express');
var math = require('mathjs');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 8080));

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(app.get('port'), function () {
  console.log('app starting at port '+ app.get('port'));
});

var mathParser = new math.parser();

app.get('/eval', function(req, resp) {
	resp.send('/eval only currently accept POST requests.');
});

app.post('/eval', function(req, resp) {
  var result = {};
  var post = req.body;
  var expr = post.text;
  var trigger = post.trigger_word;

  // do not respond to bot-users
  if(post.user_name == 'slackbot'){
  	resp.end();
  	return;
  }

  if (!expr) {
  	result.ok = false;
  	result.text = 'No message sent.';
    resp.json(result);
    return;
  }

  if (trigger) {
  	expr = expr.slice(trigger.length);
  }
  
  result.text = 'MathJS';
  
  try {
    result.ok = true;
    var answer = mathParser.eval(expr);
    result.attachments = [{
    	color: 'good',
    	author_name: '@' + post.user_name,
    	text: 'ans = *' + answer + '*',
    	mrkdwn_in: ['text']
    }];
    mathParser.scope.ans = answer;
  } catch (err) {
    result.ok = false;
    result.attachments = [{
    	color: 'danger',
    	author_name: '@' + post.user_name,
    	text: err.toString(),
    	mrkdwn_in: ['text']
    }];
    result.error = {
      type: err.name,
      message: err.message
    };
  }

  resp.json(result);

});
