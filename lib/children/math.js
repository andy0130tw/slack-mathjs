var math = require('mathjs');
var mathParser = {};

process.on('message', function(message) {
  console.log('Math.js get message', message);
});
