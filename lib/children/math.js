var math = require('mathjs');
var mathParser = new math.parser();

process.on('message', function(message) {
  if (message.type == 'eval') {
    var scope = message.scope;
    var expr = message.expr;

    mathParser.scope = scope;
    try {
      var result = mathParser.eval(expr);
      process.send({type: 'success', answer: result});
    } catch (e) {
      console.log('sending', e);
      process.send({type: 'error', err: e});
    }
  }
});
