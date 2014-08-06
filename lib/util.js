'use strict';

var debug = require('debug')('spm-client:util');

exports.errorHandle = errorHandle;

function errorHandle(err, res) {
  if (err) {
    debug('request error %s', err.stack);
    throw err;
  }
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
