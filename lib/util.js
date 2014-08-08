'use strict';

var debug = require('debug')('spm-client:util');

exports.errorHandle = errorHandle;
exports.resolveid = resolveid;

function errorHandle(res) {
  var err;
  if (res.statusCode >= 500) {
    err = new Error('Server error');
    err.statusCode = res.statusCode;
    debug(err.message);
    throw err;
  }
  var body = res.body;
  if (res.statusCode >= 400) {
    err = new Error(body.message || 'Server error');
    err.statusCode = res.statusCode;
    err.status = body.status;
    debug('%s with %s', err.message, err.statusCode);
    throw err;
  }
}

var ID_REGEX = /^([a-z][a-z0-9\-\.]*)(?:@(.+))?$/;
function resolveid(uri) {
  uri = uri.toLowerCase();
  var m = uri.match(ID_REGEX);
  if (!m) return null;
  return {
    name: m[1],
    version: m[2] || ''
  };
}
