'use strict';

var debug = require('debug')('spm-client:util');

var ID_REGEX = /^([a-z][a-z0-9\-\.]*)(?:@(.+))?$/;
var NAME_REGEX = /^[a-z][a-z0-9\-\.]*$/i;

exports.errorHandle = errorHandle;
exports.resolveid = resolveid;
exports.ID_REGEX = ID_REGEX;
exports.NAME_REGEX = NAME_REGEX;

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

function resolveid(uri) {
  uri = uri.toLowerCase();
  var m = uri.match(ID_REGEX);
  if (!m) return null;
  return {
    name: m[1],
    version: m[2] || ''
  };
}
