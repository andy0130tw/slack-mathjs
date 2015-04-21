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
  
  function r(data, surr, newl) {
    if (surr == null)
      data = surr + data + surr;
    return {
      newl: newl,
      output: data
    }
  }

  // * Reserved data to prevent code leak
  //  - Functions
  if (out instanceof Function)
    return r(reservedTerm('Function', util.getFunctionName(out)));

  // * Special data type
  //  - undefined
  if (out === undefined)
    return r(reservedTerm('undefined'));
  //  - null
  if (out === null)
    return r(reservedTerm('NULL'));
  //  - Infinity
  if (out === Infinity)
    return r('∞');
  //  - Infinity
  if (out === -Infinity)
    return r('-∞');
  //  - NaN beheavior
  if (out !== out)
    return r(reservedTerm('NOT_A_NUMBER'));

  if (typeof out === 'string')
    return r('`' + out + '`');

  // * MathJS struct duck typing
  //  - 2D Matrix
  if (out._data && out._size && out._size.length == 2) {
    var rtn = '[';
    for (var i = 0; i < out._size[0]; i++) {
      rtn += '[' + out._data[i].join(', ') + ']';
      if (i != out._size[0] - 1) rtn += ',\n ';
    }
    rtn += ']';
    return r(rtn, null, true);
  }

  if (out.toString && out.toString() === ({}).toString())
    return r(reservedTerm('Object'));
  
  // Not recognized format
  return r(out.toString() || out);
};
