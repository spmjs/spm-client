'use strict';

var cache = {};

module.exports = Mock;
module.exports.require = mockRequire;

function mockRequire(module) {
  var path = require.resolve(module);
  if (path in cache) {
    return cache[path];
  }
  if (path in require.cache) {
    throw new Error('should require ' + module + ' first');
  }
  require(module);
  var pkg = require.cache[path];
  var mock = new Mock(pkg, 'exports');
  cache[path] = mock;
  return mock;
}

function Mock(obj, prop) {
  if (!(this instanceof Mock)) {
    return new Mock(obj, prop);
  }

  var that = this;
  this.obj = obj;
  this.prop = prop;
  var orig = this.orig = obj[prop];
  this.restore();
  obj[prop] = function() {
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
  if (typeof func === 'function' || isGeneratorFn(func)) {
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

Mock.prototype.destroy = function() {
  this.obj[this.prop] = this.orig;
};

function isGeneratorFn(fn) {
  return typeof fn === 'function' &&
    fn.constructor.name === 'GeneratorFunction';
}
