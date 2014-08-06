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
  req.url = format('%s/repository/search?q=%s', args.registry, args.name);
  req.method = 'GET';
  req.json = true;
  request(req, function(err, res) {
    try {
      uitl.errorHandle(err, res);
    } catch(err) {
      return callback(err);
    }
    res.args = args;
    callback(null, res);
  });
};
