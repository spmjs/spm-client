'use strict';

var join = require('path').join;
var fs = require('fs');
var format = require('util').format;
var semver = require('semver');
var extend = require('extend');
var crypto = require('crypto');
var debug = require('debug')('spm-client:publish');
var tar = require('./tar');
var request = require('./request');

var NAME_REGEX = /^[a-z][a-z0-9\-\.]*$/i;

/*
  publish(args, config, callback)

  * args
    * cwd
    * tag
    * force
  * opt
*/

module.exports = function publish(args, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }

  args = extend({}, args, config, require('./config')());

  var pkg = require(join(args.cwd, 'package.json'));
  pkg.name = pkg.name.toLowerCase();
  try {
    checkPkg(pkg);
  } catch(e) {
    return callback(e);
  }
  var readmeFile = join(args.cwd, 'README.md');
  pkg.readme = fs.existsSync(readmeFile) ? fs.readFileSync(readmeFile).toString(): '';
  pkg.dependencies = getDependencies(pkg);
  pkg.tag = args.tag || 'stable';
  args.pkg = pkg;
  debug('publish %s@%s ~ %s', pkg.name, pkg.version, pkg.tag);

  createTar(args, function(err, target) {
    if (err) {
      return callback(err);
    }
    args.tarfile = target;
    Object.keys(args).forEach(function(key) {
      debug('argument %s: %j', key, args[key]);
    });
    pub(args, callback);
  });
};

function pub(args, callback) {
  var pkg = args.pkg;
  var auth = args.auth;
  var urlpath = format('%s/repository/%s/%s/', args.registry, pkg.name, pkg.version);

  var req = {};
  req.force = args.force;
  req.method = 'POST';
  req.url = urlpath;
  req.auth = auth;
  req.json = pkg;

  request(req, function(err, res, body) {
    try {
      errorHandle(err, res, body);
    } catch(err) {
      return callback(err);
    }

    if (args.tarfile) {
      var tarbody = fs.readFileSync(args.tarfile);
      var md5value = crypto.createHash('md5').update(tarbody).digest('hex');

      req = {};
      req.force = args.force;
      req.method = 'PUT';
      req.url = urlpath;
      req.auth = auth;
      req.body = tarbody;
      req.headers = {
        'content-type': 'application/x-tar',
        'content-encoding': 'gzip',
        'content-length': fs.statSync(args.tarfile).size,
        'x-package-md5': md5value
      };
      return request(req, function(err, res, body) {
        try {
          errorHandle(err, res, body);
        } catch(err) {
          return callback(err);
        }
        callback(null, res, body);
      });
    }
    callback(null, res, body);
  });
}

function checkPkg(pkg) {
  if (!pkg.name) {
    throw new Error('name is missing');
  }
  if (!pkg.version) {
    throw new Error('version is missing');
  }
  if (!semver.valid(pkg.version)) {
    throw new Error('version ' + pkg.version + ' is invalid');
  }
  if (!NAME_REGEX.test(pkg.name)) {
    throw new Error('name is invalid, should match ' + NAME_REGEX.toString());
  }
}

function getDependencies(pkg) {
  var deps = {};
  if (pkg.spm && pkg.spm.dependencies) {
    deps = pkg.spm.dependencies;
  }
  return Object.keys(deps).map(function(key) {
    return key + '@' + deps[key];
  });
}

function createTar(args, callback, noIgnore) {
  var directory = args.cwd;
  var pkg = args.pkg;
  var name = format('%s-%s.tar.gz', pkg.name, pkg.version || '');
  var tarfile = join(args.temp, name);
  tar.create(directory, tarfile, function(err, target) {
    if (err) {
      debug('tar error %s', err.stack);
      callback(err);
    }
    var size = fs.statSync(target).size;
    args.tarSize = (size/1024).toFixed(2) + 'KB';
    // 2 MB
    //if (size > 2079152) {
      //log.warn('size', 'package is a little big, maybe you need a .spmignore');
    //}
    debug('file %s size is %s', target, args.tarSize);
    callback(null, target);
  }, noIgnore);
}

function errorHandle (err, res, body) {
  if (err) {
    debug('request error %s', err.stack);
    throw err;
  }
  if (res.statusCode >= 500) {
    err = new Error('Server error');
    err.statusCode = res.statusCode;
    debug(err.message);
    throw err;
  }
  if (res.statusCode >= 400) {
    err = new Error(body.message || 'Server error');
    err.statusCode = res.statusCode;
    err.status = body.status;
    debug('%s with %s', err.message, err.statusCode);
    throw err;
  }
  if (body && body.message && body.status) {
    err = new Error(body.message);
    err.statusCode = res.statusCode;
    err.status = body.status;
    debug('server response error %s with %s', err.message, err.statusCode);
    throw err;
  }
}
