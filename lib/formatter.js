var util = require('./util');

function reservedTerm(type, term) {
  return '{ ' + type + (term ? (': ' + term) : '') + ' }';
}

/**
 * Serialize MathJS output to override default delegated toString()
 * @param  *                       out MathJS output
 * @return {String | Number | ...}     Serialized data that is output ready
 */
module.exports = function formatter(out) {
  
  // * Reserved data to prevent code leak
  //  - Functions
  if (out instanceof Function)
    return reservedTerm('Function', util.getFunctionName(out));

  // * Special data type
  //  - undefined
  if (out === undefined)
    return reservedTerm('undefined');
  //  - null
  if (out === null)
    return reservedTerm('NULL');
  //  - Infinity
  if (out === Infinity)
    return '∞';
  //  - Infinity
  if (out === -Infinity)
    return '-∞';
  //  - NaN beheavior
  if (out !== out)
    return reservedTerm('NOT_A_NUMBER');

  if (typeof out === 'string')
    return '`' + out + '`';

  // * MathJS struct duck typing
  //  - 2D Matrix
  if (out._data && out._size && out._size.length == 2) {
  	var rtn = '[';
  	for (var i = 0; i < out._size[0]; i++) {
      rtn += '[' + out._data[i].join(', ') + ']';
      if (i != out._size[0] - 1) rtn += ',\n ';
  	}
  	rtn += ']';
  	return rtn;
  }

  if (out.toString && out.toString() === ({}).toString())
  	return reservedTerm('Object');
  
  // Not recognized format
  return out.toString() || out;
};
