module.exports = {
  getFunctionName: function(f) {
    // http://stackoverflow.com/a/17923727/2281355
    var matches = /^function\s+([\w\$]+)\s*\(/.exec( f.toString() );
    return matches ? matches[1] : null;
  },

  /**
   * clone the scope and serialize certain values
   * should be deserialized first in order to pass to a mathjs scope
   */
  serializeScope: function(scope) {
    var nscp = {};
    for (x in scope) {
      if (scope[x] == Infinity) {
        nscp[x] = { mathjs: 'Infinity' };
      } else if (scope[x] == -Infinity) {
        nscp[x] = { mathjs: '-Infinity' };
      } else if (scope[x] != scope[x]) {
        nscp[x] = { mathjs: 'NaN' };
      } else {
        nscp[x] = scope[x];
      }
    }
    return nscp;
  }
};
