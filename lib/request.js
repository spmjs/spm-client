'use strict';

var os = require('os');
var zlib = require('zlib');
var util = require('util');
var request = require('request');
var pkg = require('../package.json');
var debug = require('debug')('spm-client:request');

var userAgent = util.format('spm-client (%s, %s, %s %s)',
  pkg.version, process.version, os.platform(), os.arch()
);

module.exports = function(args, callback) {
  callback = callback || function() {};

  args.headers = args.headers || {};

  if (args.auth) {
    args.headers['Authorization'] = 'Yuan ' + args.auth;
    delete args.auth;
  }

  if (args.force) {
    args.headers['X-Yuan-Force'] = 'true';
  }
  args.headers['user-agent'] = userAgent;

  args.headers['Accept-Language'] = args.lang || process.env.LANG || 'en_US';

  // use gzip
  if (args.json) {
    args.encoding = null;
    args.headers['accept-encoding'] = 'gzip';
  }

  debug('request %s - %s', args.method, args.url);
  Object.keys(args.headers).forEach(function(key) {
    debug('header %s: %s', key, args.headers[key]);
  });

  return request(args, function(err, res, body) {
    if (err) {
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        debug('request error with %s', err.code);
      }
      return callback(err);
    }
    if (args.json && res.headers['content-encoding'] === 'gzip') {
      zlib.gunzip(body, function(err, content) {
        if (err) {
          debug('zlib error %s', err.stack);
          return callback(err);
        }
        try {
          body = JSON.parse(content.toString());
        } catch(err) {
          debug('parse content error %s', err.stack);
          return callback(err);
        }
        res.body = body;
        callback(null, res, body);
      });
    } else {
      callback(null, res, body);
    }
  });
};
