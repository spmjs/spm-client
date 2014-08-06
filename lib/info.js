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

  if (args.version && args.version.indexOf('.') === -1) {
    args.tag = args.version;
    delete args.version;
  }

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

  request(req, function(err, res) {
    try {
      uitl.errorHandle(err, res);
    } catch(err) {
      return callback(err);
    }
    if (!res.body && args.tag) {
      err = new Error('not found on ~ ' + args.tag);
      err.statusCode = res.statusCode;
      return callback(err);
    }
    res.args = args;
    if (!res.body.tag) {
      res.body.tag = args.tag;
    }
    callback(null, res);
  });
};
