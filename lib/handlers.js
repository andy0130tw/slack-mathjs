var math = require('mathjs');

var Attachment = require('./attachment');
var formatter = require('./formatter');

var freshStart = true;

var mathParser = {};

module.exports = {
  setMathParser: function(parserObj) {
    mathParser = parserObj;
  },
  evalGet: function(req, resp) {
    resp.send('/eval only currently accept POST requests.');
  },
  evalPost: function(req, resp) {
    var result = {};
    var attachments = [], att;  // att is for temporarily store an attachment
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
      att.pretext = 'MathJS server had restarted. (last commit: ' + '2015/4/21' + ')';
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

    try {
      result.ok = true;
      var answer = mathParser.eval(expr);
      var outGuide = formatter(answer);
      var outRaw = outGuide.output;
      var output = outRaw;

      if (!outGuide.plain) output = '*' + output + '*';
      if (outGuide.newl) output = '\n' + output;

      if (answer == null) {
        att = new Attachment(dispName + ': ' + output);
        att.fallback = dispName + ': ' + outRaw;
      } else {
        att = new Attachment(dispName + ': ans = ' + output);
        att.fallback = dispName + ': ans = ' + outRaw;
        mathParser.set('ans', answer);
      }
      att.color = 'good';
      attachments.push(att);

    } catch (err) {
      result.ok = false;
      
      att = new Attachment();
      att.color = 'danger';
      att.fallback = dispName + ' ' + err.toString();
      att.text = dispName + ' *' + err.name + '*: ' + err.message;
      attachments.push(att);

      result.error = {
        type: err.name,
        message: err.message
      };
    }

    if (attachments.length)
      result.attachments = attachments;

    resp.json(result);

  }
};