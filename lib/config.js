'use strict';

var path = require('path');
var spmrc = require('spmrc');
var debug = require('debug')('spm-client:config');
var keys = Object.keys;

var _config, defaults = {
  // registry url of yuan server
  registry: spmrc.get('registry'),
  // global registry, others are private
  global_registry: 'http://spmjs.io',
  // an HTTP proxy, pass to request
  proxy: spmrc.get('proxy'),
  // the authKey that copied from spmjs accout page
  auth: spmrc.get('auth'),
  // the temp directory
  temp: spmrc.get('user.temp'),
  // cache directory
  cache: path.join(spmrc.get('user.home'), '.spm', 'cache')
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
