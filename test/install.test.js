'use strict';

require('should');
var join = require('path').join;
var log = require('spm-log');
var fs = require('fs');
var mkdirp = require('mkdirp');
var color = require('colorful');
var rimraf = require('rimraf');
var mock = require('./support/mock');
var mockRequest = mock.require('co-request');
var install = require('../lib/install');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io',
  auth: '12345'
};
// var install = require('../lib/install');
// var http = require('http');
// var fs = require('fs');
// var file = require('../lib/sdk/file');
// var log = require('../lib/utils/log');
// var server;
// var port = 12345;
// var dest = 'tests/sea-modules';
// var cache = 'tests/cache';


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
      args[1].base.should.eql(process.cwd());
      args[1].destination.should.eql(join(process.cwd(), 'spm_modules'));
      //args[1].cache.should.eql('~/.spm/cache');
      args[1].save.should.be.true;
      args[1].downloadlist.should.eql({});
      args[2].should.be.true;
    });

    it('should install dependencies', function* () {
      yield* install({
        base: join(fixtures, 'install-package'),
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
        base: join(fixtures, 'install-no-deps')
      });
      m.callCount.should.eql(0);
    });
  });

  describe('installPackage', function() {

    var logInfo = mock(log, 'info');
    afterEach(logInfo.restore.bind(logInfo));
    afterEach(mockRequest.restore.bind(mockRequest));
    after(logInfo.destroy.bind(logInfo));

    it('should return when exist in dest', function* () {
      var args = {
        name: 'a@1.0.0',
        destination: join(fixtures, 'package-dest', 'spm_modules'),
        downloadlist: {}
      };
      yield* install.installPackage(args.name, args, true);
      args.downloadlist.should.have.property('a@1.0.0');
      logInfo.callCount.should.eql(1);
      logInfo.callCache[0].arguments.should.eql(['found', 'a@1.0.0']);
    });

    it('should install stable return when exist in dest', function* () {
      var args = {
        name: 'tmp',
        destination: join(fixtures, 'package-dest', 'spm_modules'),
        cache: join(fixtures, 'cache'),
        downloadlist: {}
      };
      mockRequest.intercept(function* () {
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
      var args = {
        name: 'tmp',
        destination: join(fixtures, 'tmp', 'spm_modules'),
        cache: join(fixtures, 'cache'),
        downloadlist: {}
      };
      mockRequest.intercept(function* () {
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
      rimraf.sync(join(fixtures, 'tmp'));

      function getFistArgs(cache) {
        return cache.arguments[0];
      }
    });

    it('should download when file\'s md5 changed', function* () {

    });

    it('should download force', function* () {

    });

    it('should install dependencies', function* () {

    });

    it.only('should save to package.json', function* () {
      var tmpDir = join(fixtures, 'tmp');
      var pkgPath = join(tmpDir, 'package.json');
      mkdirp(tmpDir);
      fs.writeFileSync(pkgPath, '{"name": "a", "version": "1.0.0"}');
      var args = {
        name: 'tmp',
        base: tmpDir,
        destination: join(fixtures, 'package-dest', 'spm_modules'),
        save: true,
        downloadlist: {}
      };
      mockRequest.intercept(function* () {
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
