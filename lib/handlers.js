var math = require('mathjs');
var childProcess = require('child_process');

var Attachment = require('./attachment');
var formatter = require('./formatter');

var freshStart = true;

var mathjsParser = math.parser();
var mathjsChildOptions = {
    stdio: 'ipc',
    //timeout: 5 * 1000
  };

var mathjsTimeout = 5 * 1000;

module.exports = {
  evalGet: function(req, resp) {
    resp.send('/eval only accept POST requests currently.');
  },
  evalPost: function(req, resp) {
    var result = {};
    var attachments = [], att;  // att is for temporarily storing an attachment
    var post = req.body;
    var expr = post.text;
    var trigger = post.trigger_word;

    // do not respond to bot-users (including itself)
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
      //truncate trigger word
      expr = expr.slice(trigger.length);
    }

    var dispName = '@' + post.user_name;
    result.text = '\00';

    if (freshStart) {
      att = new Attachment('Welcome to MathJS v' + math.version + '! \n Configurations:');
      att.pretext = 'MathJS server had restarted. (last commit: ' + '2015/5/1' + ')';
      att.fields = [];
      var config = math.config();
      for (var x in config) {
        att.fields.push({
          title: x,
          value: config[x],
          short: true
        });
      }
      attachments.push(att);
      freshStart = false;
    }

    result.ok = true;

    // var child = childProcess.spawnSync('node', ['./children/math.js'], mathjsChildOptions);
    var child = childProcess.fork('./lib/children/math.js', mathjsChildOptions);
    child.on('exit', function(code, sig) {
      if (sig) {
        console.log('timeout, killed');
        att = new Attachment(dispName + ' *TimeoutError*: Timeout after ' + mathjsTimeout + 'ms, killed.');
        att.color = 'warning';
        attachments.push(att);
      }
      sendAttachments();
    });

    var timer = setTimeout(function() {
      child.kill();
    }, mathjsTimeout);

    child.send({
      type: 'eval',
      scope: util.serializeScope(mathjsParser.scope),
      expr: expr
    });

    child.on('message', function(message) {
      var status = message.type;
      if (status == 'success') {
        successHandler(message);
        sendAttachments();
      } else if (status == 'error') {
        errorHandler(message);
        sendAttachments();
      }
    });

    function successHandler(message) {
      var answer = message.answer;
      var outGuide = formatter(answer);
      var outRaw = outGuide.output;
      var output = outRaw;

      if (outGuide.newl)
        output = '\n' + output;
      else
        output = '*' + output + '*';

      if (answer == null) {
        att = new Attachment(dispName + ': ' + output);
        att.fallback = dispName + ': ' + outRaw;
      } else {
        att = new Attachment(dispName + ': ans = ' + output);
        att.fallback = dispName + ': ans = ' + outRaw;
        mathjsParser.scope = message.scope;
        mathjsParser.set('ans', answer);
      }
      att.color = 'good';
      attachments.push(att);
    }

    function errorHandler(message) {
      result.ok = false;
      var err = message.err;
      if (err.message.indexOf('(char 1)') >= 0){
        // fail silently
        result.text = '';
      } else {
        att = new Attachment();
        att.color = 'danger';
        att.fallback = dispName + ' ' + err.toString();
        att.text = dispName + ' *' + err.name + '*: ' + err.message;
        attachments.push(att);
      }

      result.error = {
        type: err.name,
        message: err.message
      };
    }

    function sendAttachments() {
      // remove timeout kill
      clearTimeout(timer);
      if (attachments.length)
        result.attachments = attachments;
      return resp.json(result);
    }

  },

  scopeReadGet: function(req, resp) {
    resp.json(mathjsParser.scope);
  }

};
