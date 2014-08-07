'use strict';

var extend = require('extend');
var request = require('./request');
var uitl = require('./util');
var debug = require('debug')('spm-client:info');

/*
  login(args, config)

  args
  - username
  - authkey
  config
*/

module.exports = function* login(args, config) {
  args = extend({}, args, config, require('./config')());

  if (!(args.authkey && args.username)) {
    throw new Error('Missing parameters.');
  }

  var req = {};
  req.url = args.registry + '/account/login/';
  req.method = 'POST';
  req.json = {
    account: args.username,
    authkey: args.authkey
  };

  debug('login %s', args.username);
  var res = yield* request(req);
  uitl.errorHandle(res);
  return res.body;
};
