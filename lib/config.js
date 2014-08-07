'use strict';

var debug = require('debug')('spm-client:config');

var _config = {
  registry: undefined,
  proxy: undefined,
  auth: undefined,
  temp: getTemp()
};

module.exports = function config(obj) {
  if (!obj) {
    debug('get %j', _config);
    return _config;
  }
  copy(_config, obj || {});
  debug('set %j', _config);
  return _config;
};

function copy(dest, src) {
  Object.keys(dest).forEach(function(key) {
    if (src[key]) {
      dest[key] = src[key];
    }
  });
  return dest;
}

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
