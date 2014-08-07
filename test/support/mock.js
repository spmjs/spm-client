'use strict';

exports.require = function(module) {
  var path = require.resolve(module);
  if (path in require.cache) {
    throw new Error('should require before ' + module);
  }
  require(module);
  var cache = require.cache[path];
  return new Mock(cache);
};

function Mock(cache) {
  var that = this;
  var orig = cache.exports;
  this.restore();
  cache.exports = function() {
    var ret, err, args = [].slice.call(arguments);
    try {
      if (that._intercept) {
        ret = that._intercept.apply(this, args);
      } else {
        ret = orig.apply(this, args);
      }
    } catch(e) {
      err = e;
    }
    that.watch({
      'arguments': args,
      'context': this,
      'return': ret,
      'error': err
    });
    if (err) throw err;
    return ret;
  };
}

Mock.prototype.intercept = function(func) {
  if (typeof func === 'function') {
    this._intercept = func;
  }
};

Mock.prototype.watch = function(obj) {
  this.callCount++;
  this.callCache.push(obj);
};

Mock.prototype.restore = function() {
  this._intercept = null;
  this.callCount = 0;
  this.callCache = [];
};
