'use strict';

var debug = require('debug')('spm-client:config');
var keys = Object.keys;

var _config, defaults = {
  // registry url of yuan server
  registry: undefined,
  // global registry, others are private
  global_registry: 'http://spmjs.io',
  // an HTTP proxy, pass to request
  proxy: undefined,
  // the authKey that copied from spmjs accout page
  auth: undefined,
  // the temp directory
  temp: getTemp()
};

module.exports = config;
module.exports.reset = reset;

// reset _config first
reset();

function config(obj) {
  if (!obj) {
    debug('get %j', _config);
    return _config;
  }
  copy(_config, obj);
  debug('set %j', _config);
  return _config;
}

function reset() {
  _config = {};
  keys(defaults).forEach(function(key) {
    _config[key] = defaults[key];
  });
}

function copy(dest, src) {
  keys(dest).forEach(function(key) {
    if (src[key] !== null && src[key] !== undefined) {
      dest[key] = src[key];
    }
  });
  return dest;
}

/* istanbul ignore next */
function getTemp() {
  var tmpdir = process.env.TMPDIR || process.env.TMP || process.env.TEMP;
  if (!tmpdir) {
    if (process.platform === 'win32') {
      tmpdir = 'c:\\windows\\temp';
    } else {
      tmpdir = '/tmp';
    }
  }
  return tmpdir;
}
