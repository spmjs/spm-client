'use strict';

require('should');
var join = require('path').join;
var dirname = require('path').dirname;
var log = require('spm-log');
var fs = require('fs');
var mkdirp = require('mkdirp');
var color = require('colorful');
var rimraf = require('rimraf');
var mock = require('./support/mock');
var mockRequest = mock.require('request');
var mockCoRequest = mock.require('co-request');
var install = require('../lib/install');

var fixtures = join(__dirname, 'fixtures');

describe('/lib/install.js', function() {

  var m = mock(install, 'installPackage');
  afterEach(m.restore.bind(m));
  after(m.destroy.bind(m));

  describe('install', function() {

    beforeEach(m.intercept.bind(m, function* (){}));

    it('should install package', function* () {
      yield* install({
        name: 'a',
        save: true
      });
      m.callCount.should.eql(1);
      var args = m.callCache[0].arguments;
      args[0].should.eql('a');
      args[1].cwd.should.eql(process.cwd());
      args[1].destination.should.eql(join(process.cwd(), 'spm_modules'));
      //args[1].cache.should.eql('~/.spm/cache');
      args[1].save.should.be.true;
      args[1].downloadlist.should.eql({});
      args[2].should.be.true;
    });

    it('should install package support array', function* () {
      yield* install({
        name: ['a@1.0.0'],
        save: true,
        cwd: 'relative'
      });
      m.callCount.should.eql(1);
      var args = m.callCache[0].arguments;
      args[0].should.eql('a@1.0.0');
      args[1].cwd.should.eql(join(process.cwd(), 'relative'));
      args[1].destination.should.eql(join(process.cwd(), 'relative', 'spm_modules'));
      //args[1].cache.should.eql('~/.spm/cache');
      args[1].save.should.be.true;
      args[1].downloadlist.should.eql({});
      args[2].should.be.true;
    });

    it('should install dependencies', function* () {
      yield* install({
        cwd: join(fixtures, 'install-package'),
        save: true,
        saveDev: true
      });
      m.callCount.should.eql(2);
      m.callCache[0].arguments[0].should.eql('b@1.0.0');
      m.callCache[1].arguments[0].should.eql('c@1.0.0');
      m.callCache[0].arguments[1].save.should.be.false;
      m.callCache[0].arguments[1].saveDev.should.be.false;
    });

    it('should not install package when no dependencies', function* () {
      yield* install({
        cwd: join(fixtures, 'install-no-deps')
      });
      m.callCount.should.eql(0);
    });
  });

  describe('installPackage', function() {

    var logInfo = mock(log, 'info');
    afterEach(logInfo.restore.bind(logInfo));
    afterEach(mockCoRequest.restore.bind(mockCoRequest));
    afterEach(mockRequest.restore.bind(mockRequest));
    afterEach(removeTmp);
    after(logInfo.destroy.bind(logInfo));

    var tmpDir = join(fixtures, 'tmp');
    function removeTmp(done) {
      if (!fs.existsSync(tmpDir)) return done();
      rimraf(tmpDir, done);
    }

    function getFistArgs(cache) {
      return cache.arguments[0];
    }

    it('should return when exist in dest', function* () {
      var args = {
        name: 'a@1.0.0',
        destination: join(fixtures, 'package-dest', 'spm_modules'),
        downloadlist: {}
      };
      yield* install.installPackage(args.name, args, true);
      args.downloadlist.should.have.property('a@1.0.0');
      logInfo.callCount.should.eql(2);
      logInfo.callCache[1].arguments.should.eql(['found', 'a@1.0.0']);
    });

    it('should install stable return when exist in dest', function* () {
      var args = {
        name: 'tmp',
        destination: join(fixtures, 'package-dest', 'spm_modules'),
        cache: join(fixtures, 'cache'),
        downloadlist: {}
      };
      mockCoRequest.intercept(function* () {
        /* jshint noyield: true */
        return {
          headers: {},
          body: require(join(fixtures, 'more-packages.json')),
          statusCode: 200
        };
      });
      yield* install.installPackage(args.name, args, false);
      args.downloadlist.should.have.property('tmp@0.0.2');
      logInfo.callCount.should.eql(2);
      logInfo.callCache[0].arguments.should.eql(['install', color.magenta('tmp@stable')]);
      logInfo.callCache[1].arguments.should.eql(['found', 'tmp@0.0.2']);
    });

    it('should install from cache', function* () {
      var dest = join(fixtures, 'tmp', 'spm_modules');
      var args = {
        name: 'tmp',
        destination: dest,
        cache: join(fixtures, 'cache'),
        downloadlist: {}
      };
      mockCoRequest.intercept(function* () {
        /* jshint noyield: true */
        return {
          headers: {},
          body: require(join(fixtures, 'more-packages.json')),
          statusCode: 200
        };
      });
      yield* install.installPackage(args.name, args, false);

      logInfo.callCount.should.eql(3);
      var firstArgs = logInfo.callCache.map(getFistArgs);
      firstArgs.should.eql(['install', 'extract', 'installed']);
      var pkg = require(join(dest, 'tmp', '0.0.2', 'package.json'));
      pkg.name.should.eql('popomore-tmp');
      pkg.version.should.eql('0.0.2');
      rimraf.sync(join(fixtures, 'tmp'));
    });

    it('should download when file\'s md5 changed', function* () {
      var dest = join(fixtures, 'tmp', 'spm_modules');
      var cacheSrc = join(fixtures, 'cache');
      var cache = join(fixtures, 'tmp', 'cache');
      yield copy(join(cacheSrc, 'tmp-0.0.2.tar.gz'), join(cache, 'tmp-0.0.2.tar.gz'));
      var args = {
        name: 'tmp',
        destination: dest,
        cache: cache,
        downloadlist: {},
        registry: 'http://spmjs.io'
      };
      mockRequest.intercept(function() {
        return fs.createReadStream(join(cacheSrc, 'tmp-0.0.2.tar.gz'));
      });
      mockCoRequest.intercept(function* () {
        var pkg = require(join(fixtures, 'more-packages.json'));
        pkg.packages['0.0.2'].md5 = '12345';
        /* jshint noyield: true */
        return {
          headers: {},
          body: pkg,
          statusCode: 200
        };
      });
      yield* install.installPackage(args.name, args, false);
      var firstArgs = logInfo.callCache.map(getFistArgs);
      firstArgs.should.eql(['install', 'download', 'extract', 'installed']);
      fs.existsSync(join(cache, 'tmp-0.0.2.tar.gz')).should.be.true;
      var pkg = require(join(dest, 'tmp', '0.0.2', 'package.json'));
      pkg.name.should.eql('popomore-tmp');
      pkg.version.should.eql('0.0.2');
    });

    it('should download force', function* () {
      var dest = join(fixtures, 'tmp', 'spm_modules');
      var cache = join(fixtures, 'tmp', 'cache');
      var args = {
        name: 'tmp',
        destination: dest,
        cache: cache,
        downloadlist: {},
        registry: 'http://spmjs.io',
        force: true
      };
      mockRequest.intercept(function() {
        return fs.createReadStream(join(fixtures, 'cache', 'tmp-0.0.2.tar.gz'));
      });
      mockCoRequest.intercept(function* () {
        /* jshint noyield: true */
        return {
          headers: {},
          body: require(join(fixtures, 'more-packages.json')),
          statusCode: 200
        };
      });
      yield* install.installPackage(args.name, args, false);
      var firstArgs = logInfo.callCache.map(getFistArgs);
      firstArgs.should.eql(['install', 'download', 'extract', 'installed']);
      fs.existsSync(join(cache, 'tmp-0.0.2.tar.gz')).should.be.true;
      var pkg = require(join(dest, 'tmp', '0.0.2', 'package.json'));
      pkg.name.should.eql('popomore-tmp');
      pkg.version.should.eql('0.0.2');
    });

    it('should install dependencies', function* () {
      var dest = join(fixtures, 'tmp', 'spm_modules');
      var cache = join(fixtures, 'tmp', 'cache');
      var args = {
        name: 'a@1.1.0',
        destination: dest,
        cache: cache,
        downloadlist: {},
        registry: 'http://spmjs.io',
        force: true
      };
      mockRequest.intercept(function() {
        return fs.createReadStream(join(fixtures, 'cache', 'tmp-0.0.2.tar.gz'));
      });
      mockCoRequest.intercept(function* (args) {
        var filename = 'package-deps-' + args.url.split('/').slice(-3, -1).join('-') + '.json';
        return {
          headers: {},
          body: require(join(fixtures, filename)),
          statusCode: 200
        };
      });
      yield* install.installPackage(args.name, args, false);
      fs.existsSync(join(dest, 'a', '1.1.0'));
      fs.existsSync(join(dest, 'b', '1.0.0'));
      fs.existsSync(join(dest, 'c', '1.0.0'));
    });

    it('should save to package.json', function* () {
      var tmpDir = join(fixtures, 'tmp');
      var pkgPath = join(tmpDir, 'package.json');
      mkdirp.sync(tmpDir);
      fs.writeFileSync(pkgPath, '{"name": "a", "version": "1.0.0"}');
      var args = {
        name: 'tmp',
        cwd: tmpDir,
        destination: join(fixtures, 'package-dest', 'spm_modules'),
        save: true,
        downloadlist: {}
      };
      mockCoRequest.intercept(function* () {
        /* jshint noyield: true */
        return {
          headers: {},
          body: require(join(fixtures, 'more-packages.json')),
          statusCode: 200
        };
      });
      yield* install.installPackage(args.name, args, true);
      var pkg = require(pkgPath);
      pkg.spm.dependencies.should.eql({
        tmp: '0.0.2'
      });
      rimraf.sync(tmpDir);
    });
  });
});

function copy(src, dest) {
  mkdirp.sync(dirname(dest));
  return function(callback) {
    fs.createReadStream(src)
      .once('error', callback)
      .once('end', callback)
      .pipe(fs.createWriteStream(dest));
  };
}
