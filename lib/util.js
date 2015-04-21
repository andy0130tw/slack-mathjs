module.exports = {
  getFunctionName: function(f) {
    // http://stackoverflow.com/a/17923727/2281355
    var matches = /^function\s+([\w\$]+)\s*\(/.exec( f.toString() );
    return matches ? matches[1] : null;
  }
};
