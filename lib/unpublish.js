'use strict';

var extend = require('extend');
var format = require('util').format;
var request = require('./request');
var uitl = require('./util');

module.exports = function(args, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }

  args = extend({}, args, config, require('./config')());

  var req = {};
  req.url = format('%s/repository/%s/', args.registry, args.name);
  if (args.version) {
    req.url += args.version + '/';
  }
  req.method = 'DELETE';
  req.json = true;
  req.auth = args.auth;

  console.log(req);
  request(req, function(err, res, body) {
    try {
      uitl.errorHandle(err, res);
    } catch(err) {
      return callback(err);
    }
    res.args = args;
    callback(null, res, body);
  });
};
