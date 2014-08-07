'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var uitl = require('./util');

/*
  unpublish(args, config)

  args
  - name
  - version
  config
*/

module.exports = function* unpublish(args, config) {
  args = extend({}, args, config, require('./config')());

  var req = {};
  req.url = format('%s/repository/%s/%s', args.registry, args.name,
    args.version ? args.version + '/' : '');
  req.method = 'DELETE';
  req.json = true;
  req.auth = args.auth;

  var res = yield* request(req);
  uitl.errorHandle(res);
  return res.body;
};
