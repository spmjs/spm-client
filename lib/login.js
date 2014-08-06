'use strict';

var extend = require('extend');
var request = require('./request');
var uitl = require('./util');

module.exports = function login(args, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }
  args = extend({}, args, config, require('./config')());

  if (!(args.authkey && args.username)) {
    var err = new Error('Missing parameters.');
    return callback(err);
  }

  var req = {};
  req.url = args.registry + '/account/login';
  req.method = 'POST';
  req.json = {
    account: args.username,
    authkey: args.authkey
  };

  request(req, function(err, res) {
    try {
      uitl.errorHandle(err, res);
    } catch(err) {
      return callback(err);
    }
    callback(null, res);
  });
};
