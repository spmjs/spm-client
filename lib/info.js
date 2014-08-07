'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var uitl = require('./util');
var debug = require('debug')('spm-client:info');

module.exports = function* info(args, config) {
  args = extend({}, args, config, require('./config')());

  // name@tag
  if (args.version && args.version.indexOf('.') === -1) {
    args.tag = args.version;
    delete args.version;
  }
  debug('get package info name(%s) - version(%s) - tag(%s)',
    args.name, args.version || '', args.tag || '');

  var req = {};
  if (args.version) {
    req.url = format('%s/repository/%s/%s/', args.registry, args.name, args.version);
  } else if (args.name) {
    req.url = format('%s/repository/%s/', args.registry, args.name);
  } else {
    req.url = format('%s/repository/', args.registry);
  }
  req.method = 'GET';
  req.json = true;

  var res = yield* request(req);

  uitl.errorHandle(res);
  if (!res.body && args.tag) {
    var err = new Error('not found on ~ ' + args.tag);
    err.statusCode = res.statusCode;
    throw err;
  }

  var body = getPackage(res.body, args);
  debug('response body %j', body);
  return body;
};

function getPackage(body, args) {
  if (!body.packages) return body;
  var version = args.version ||
    Object.keys(body.packages).sort(function(a, b){
      return a < b;
    });
  debug('get package version %s', version);
  return body.packages[version] || body;
}
