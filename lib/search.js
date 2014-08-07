'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var uitl = require('./util');
var debug = require('debug')('spm-client:search');

/*
  info(args, config)

  args
  - name
  config
*/

module.exports = function* search(args, config) {
  args = extend({}, args, config, require('./config')());

  var req = {};
  req.url = format('%s/repository/search?q=%s', args.registry, args.name);
  req.method = 'GET';
  req.json = true;

  debug('search package with %s', args.name);
  var res = yield* request(req);
  uitl.errorHandle(res);

  return res.body;
};
