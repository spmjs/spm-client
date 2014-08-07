'use strict';

var os = require('os');
var zlib = require('zlib');
var util = require('util');
var coRequest = require('co-request');
var pkg = require('../package.json');
var debug = require('debug')('spm-client:request');

var userAgent = util.format('spm-client (%s, %s, %s %s)',
  pkg.version, process.version, os.platform(), os.arch()
);

module.exports = function* request(args) {
  args.headers = args.headers || {};
  args.headers['user-agent'] = userAgent;
  args.headers['Accept-Language'] = args.lang || process.env.LANG || 'en_US';
  if (args.auth) {
    args.headers['Authorization'] = 'Yuan ' + args.auth;
    delete args.auth;
  }
  if (args.force) {
    args.headers['X-Yuan-Force'] = 'true';
  }

  // use gzip
  if (args.json) {
    args.encoding = null;
    args.headers['accept-encoding'] = 'gzip';
  }

  debug('request %s %s', args.method, args.url);
  Object.keys(args.headers).forEach(function(key) {
    debug('header %s: %s', key, args.headers[key]);
  });

  var res;
  try {
    res = yield coRequest(args);
  } catch(err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      debug('request error with %s', err.code);
    }
    throw err;
  }

  var body = res.body;
  if (args.json && res.headers['content-encoding'] === 'gzip') {
    res.body = yield gunzip(body);
  }
  return res;
};

function parseBody(body) {
  try {
    return JSON.parse(body.toString());
  } catch(err) {
    debug('parse content error %s, stack %s', body.toString(), err.stack);
    return body;
  }
}

function gunzip(body) {
  return function(callback) {
    zlib.gunzip(body, function(err, content) {
      if (err) {
        debug('zlib error %s', err.stack);
        return callback(err);
      }
      callback(null, parseBody(content));
    });
  };
}
