'use strict';

var path = require('path');
var join = path.join;
var fs = require('fs');
var exists = fs.existsSync;
var format = require('util').format;
var semver = require('semver');
var extend = require('extend');
var crypto = require('crypto');
var log = require('spm-log');
var debug = require('debug')('spm-client:publish');
var tar = require('./tar');
var request = require('./request');
var util = require('./util');

var defaults = {
  cwd: process.cwd()
};

/*
  publish(args, config, callback)

  * args
    * cwd: where is your package
    * tag: publish with a given tag that you can install by name@tag, default is stable
  * config: see client.config
*/

module.exports = function* publish(args, config) {
  args = extend({}, require('./config')(), config, defaults, args);
  args.cwd = path.resolve(args.cwd);

  log.info('target', args.registry);

  // read package
  var pkg, pkgPath = join(args.cwd, 'package.json');
  try {
    pkg = require(pkgPath);
  } catch(e) {
    debug('%s not found', pkgPath);
  }

  checkPkg(pkg, args);

  if (pkg['private'] === true && args.registry === args.global_registry) {
    debug('private package %s = %s', args.registry, args.global_registry);
    throw new Error('it\'s private package, can\'t publish to ' + args.registry);
  }

  pkg.name = pkg.name.toLowerCase();
  pkg.tag = args.tag || 'stable';
  pkg.readme = getReadme(args.cwd);
  pkg.dependencies = getDependencies(pkg);

  args.pkg = pkg;
  args.url = format('%s/repository/%s/%s/', args.registry, pkg.name, pkg.version);

  debug('publish %s@%s ~ %s', pkg.name, pkg.version, pkg.tag);
  Object.keys(args).forEach(function(key) {
    debug('argument %s: %j', key, args[key]);
  });

  // publish package
  var req = {};
  req.method = 'POST';
  req.url = args.url;
  req.auth = args.auth;
  req.json = pkg;

  var res = yield* request(req);
  util.errorHandle(req, res);

  // upload tarfile
  return yield* upload(args);
};

function* upload(args) {
  var tarfile = yield createTar(args);
  var tarbody = fs.readFileSync(tarfile);
  var tarSize = fs.statSync(tarfile).size;
  var sizeHuman = (tarSize/1024).toFixed(2) + 'KB';
  debug('create tarfile %s size is %s', tarfile, sizeHuman);
  log.info('tarfile', path.basename(tarfile) + ' - ' + sizeHuman);
  // 2 MB
  if (tarSize > 2079152) {
    log.warn('size', 'package is a little big, maybe you need a .spmignore');
  }

  var req = {};
  req.force = args.force;
  req.method = 'PUT';
  req.url = args.url;
  req.auth = args.auth;
  req.body = tarbody;
  req.headers = {
    'content-type': 'application/x-tar',
    'content-encoding': 'gzip',
    'content-length': tarSize,
    'x-package-md5': crypto.createHash('md5').update(tarbody).digest('hex')
  };
  var res = yield* request(req);
  try {
    res.body = JSON.parse(res.body);
  } catch(e) {}
  util.errorHandle(req, res);
  return res.body;
}

function checkPkg(pkg, args) {
  if (!pkg) {
    throw new Error('package.json not found');
  }
  if (!pkg.name) {
    throw new Error('name key is missing');
  }
  if (!pkg.version) {
    throw new Error('version key is missing');
  }
  if (!util.NAME_REGEX.test(pkg.name)) {
    throw new Error('name is invalid, should match ' + util.NAME_REGEX.toString());
  }
  if (!semver.valid(pkg.version)) {
    throw new Error('version ' + pkg.version + ' is invalid');
  }
  if (!pkg.spm) {
    throw new Error('spm key is missing');
  }
  if (!exists(join(args.cwd, pkg.spm.main || 'index.js'))) {
    throw new Error('main file is missing');
  }
}

function getDependencies(pkg) {
  var deps = pkg.spm.dependencies || {};
  return Object.keys(deps).map(function(key) {
    return key + '@' + deps[key];
  });
}

function createTar(args, noIgnore) {
  var directory = args.cwd;
  var pkg = args.pkg;
  var name = format('%s-%s.tar.gz', pkg.name, pkg.version);
  var tarfile = join(args.temp, name);
  return function(callback) {
    tar.create(directory, tarfile, function(err, target) {
      if (err) {
        debug('tar error %s', err.stack);
        callback(err);
      }
      callback(null, target);
    }, noIgnore);
  };
}

function getReadme(dir) {
  var readmeFile = join(dir, 'README.md');
  return fs.existsSync(readmeFile) ? fs.readFileSync(readmeFile).toString(): '';
}
