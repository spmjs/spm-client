'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var async = require('async');
var color = require('colorful');
var mkdirp = require('mkdirp');
var extend = require('extend');
var _ = require('lodash');
var spmrc = require('spmrc');
var log = require('spm-log');
var gulp = require('gulp');
var gunzip = require('gulp-gunzip');
var untar = require('gulp-untar2');
var source = require('vinyl-source-stream');
var pipe = require('multipipe');
var util = require('./util');
var info = require('./info');
var request = require('./request');
var debug = require('debug')('spm-client:install');

var downloaded = {};

var homedir = spmrc.get('user.home');

module.exports = install;

//var config = install.config = {};
// var defaults = install.defaults = {
//   dest: spmrc.get('install.path'),
//   cache: path.join(homedir, '.spm', 'cache'),
//   parallel: 1
// };
install.fetch = fetch;

function install(args, config, callback) {
  if (typeof config === 'function') {
    callback = config;
    config = {};
  }
  if (!callback) {
    callback = function() {};
  }

  downloaded = {};
  var defaults = {
    base: process.cwd(),
    destination: 'spm_modules',
    cache: path.join(homedir, '.spm', 'cache'),
    parallel: 1
  };
  args = extend(defaults, args, config, require('./config')());
  args.dest = path.join(args.base, args.destination);

  var packages, name = args.name;
  if (name && name.length && name[0].charAt(0) !== '.') {
    packages = args.name;
  } else {
    var pkgPath = path.join(args.base, 'package.json');
    packages = parseDependencies(pkgPath, true);
  }

  if (!packages.length) {
    return callback();
  }

  queueInstall(packages, args, callback, true);
}

function queueInstall(tasks, args, callback, saveDeps) {
  var errors = [];
  var q = async.queue(function(task, callback) {
    if (typeof task === 'string') {
      task = util.resolveid(task);
      if (!task) {
        log.error('error', 'invalid module name');
        return;
      }
    }
    spmInstall(task, args, callback, saveDeps);
  }, args.parallel);

  tasks.forEach(function(task) {
    q.push(task, function(err) {
      if (err) {
        log.error('error', err);
        errors.push(err);
      }
    });
  });

  q.drain = function() {
    if (errors.length) {
      console.log();
      log.error('error', errors.join(', '));
    } else {
      callback(null, downloaded);
    }
  };
}

/* Install a package.
 *
 * The process of the installation:
 *
 *  1. Find and download the package from yuan or cache
 *  2. Copy the files to `sea-modules/{name}/{version}/{file}
 */
function spmInstall(data, args, callback, saveDeps) {
  var pkgId;
  if (data.version) {
    pkgId = data.name + '@' + data.version;
    var dest = path.join(args.dest, data.name, data.version);
    if (!args.force && fs.existsSync(dest)) {
      log.info('found', pkgId);
      downloaded[pkgId] = data;
      callback(null, data);
      return;
    }
  } else {
    pkgId = data.name + '@stable';
  }

  if (pkgId in downloaded) {
    // The package is downloaded already
    log.debug('ignore', pkgId);
    callback(null, downloaded[pkgId]);
    return;
  }

  async.waterfall([
    function(callback) {
      log.info('install', color.magenta(pkgId));
      callback(null, pkgId);
    }, function(query, callback) {
      fetch(query, args, callback);
    }
  ], function(err, dest) {
    if (err) {
      callback(err);
      return;
    }

    var relativePath = path.relative(process.cwd(), dest);
    log.info('installed', color.green(relativePath));
    var pkg = readJSON(path.join(dest, 'package.json'));

    // save dependencies to package.json
    if (saveDeps) {
      save(pkg.name, pkg.version, args);
    }

    var packages = parseDependencies(pkg);
    if (packages.length) {
      log.info('depends', packages.join(', '));
    }

    var id = pkg.name + '@' + pkg.version;
    downloaded[id] = pkg;

    if (packages.length) {
      queueInstall(packages, args, function(err) {
        callback(err, pkg);
      }, false);
    } else {
      callback(err, pkg);
    }
  });
}

/* Fetch and download the package
 *
 * The main fetch process:
 *
 *  1. Query information from yuan
 *  2. If the package is in cache and md5 matches, extract the cached tarball
 *  3. If not, fetch from yuan and extract it
 */
function fetch(query, args, callback) {
  log.info('fetch', query);
  var data = util.resolveid(query);

  info(data, function(err, res) {
    if (err) {
      // when yuan is not available
      return callback(err);
    }
    var filename, body = res.body;
    if(body.filename) {
      filename = body.filename;
    } else {
      filename = body.name + '-' + body.version + '.tar.gz';
    }

    var dest = path.join(args.dest, body.name, body.version);
    var cacheDest = path.join(args.cache, filename);

    if (!args.force && fs.existsSync(dest)) {
      var pkgId = body.name + '@' + body.version;
      log.info('found', pkgId);
      callback(null, dest);
    } else if (!args.force && fs.existsSync(cacheDest) && md5file(cacheDest) === body.md5) {
      extract(cacheDest, dest, callback);
    } else {
      fetchTarball(args.registry + '/repository/' + body.name + '/' + body.version + '/' + filename, dest, args, callback);
    }
  });
}

function fetchTarball(urlpath, dest, args, callback) {
  mkdirp(path.dirname(dest));
  log.info('download', urlpath);

  var data = {
    url: urlpath,
    method: 'GET',
    encoding: null
  };

  var stream = pipe(
    request(data),
    source(path.basename(urlpath)),
    gulp.dest(args.cache),
    gunzip(),
    untar(),
    gulp.dest(dest)
  );
  stream.on('error', callback);
  stream.on('end', function() {
    callback(null, dest);
  });
  stream.resume();
}

function extract(src, dest, callback) {
  log.info('extract', src);
  var stream = pipe(
    gulp.src(src),
    gunzip(),
    untar(),
    gulp.dest(dest)
  );
  stream.on('error', callback);
  stream.on('end', function() {
    callback(null, dest);
  });
  stream.resume();
}

function parseDependencies(pkg, includeDev) {
  if (typeof pkg === 'string') {
    pkg = readJSON(pkg);
  }
  if (!pkg) {
    return [];
  }
  var deps = {};
  pkg.spm = pkg.spm || {};
  if (pkg.spm.dependencies) {
    deps = pkg.spm.dependencies;
  }
  if (includeDev && pkg.spm.devDependencies) {
    deps = _.extend(deps, pkg.spm.devDependencies);
  }
  if (includeDev && pkg.spm.engines) {
    deps = _.defaults(deps, pkg.spm.engines);
  }

  return Object.keys(deps).map(function(key) {
    return key + '@' + deps[key];
  });
}

function save(name, version, args) {
  if (!args.save && !args.saveDev) {
    return;
  }

  var pkg;
  if (!fs.existsSync('package.json')) {
    log.error('missing', 'package.json');
    return;
  } else {
    pkg = readJSON(path.join(args.base, 'package.json'));
    pkg.spm = pkg.spm || {};
  }

  if (args.save) {
    log.info('deps saved', name + '@' + version);
    pkg.spm.dependencies = pkg.spm.dependencies || {};
    pkg.spm.dependencies[name] = version;
  }
  if (args.saveDev) {
    log.info('devDeps saved', name + '@' + version);
    pkg.spm.devDependencies = pkg.spm.devDependencies || {};
    pkg.spm.devDependencies[name] = version;
  }
  mkdirp(args.base);
  fs.writeFileSync(path.join(args.base, 'package.json'), JSON.stringify(pkg, null, 2));
}

function md5file(fpath) {
  var md5 = crypto.createHash('md5');
  return md5.update(fs.readFileSync(fpath)).digest('hex');
}

function readJSON(filepath) {
  //log.debug('parse', file.cleanpath(filepath));
  try {
    return JSON.parse(fs.readFileSync(filepath));
  } catch (e) {
    log.warn('json', e.message);
    return null;
  }
}
