var math = require('mathjs');
var mathParser = new math.parser();

process.on('message', function(message) {
  if (message.type == 'eval') {
    var scope = message.scope;
    var expr = message.expr;

    mathParser.scope = scope;
    try {
      var result = mathParser.eval(expr);
      process.send({type: 'success', answer: result, scope: scope});
    } catch (e) {
      // cannot pass error object... extract message instead
      process.send({type: 'error', err: {
          name: e.name,
          message: e.message,
          toString: function() {
            return [this.name, this.message].join(' ')
          }
        }
      });
    }
  }
});
