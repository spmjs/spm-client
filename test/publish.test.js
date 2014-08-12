'use strict';

var should = require('should');
var join = require('path').join;
var mockRequest = require('spy').require('co-request');
//console.log(require.cache)
var publish = require('../lib/publish');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io',
  auth: '12345'
};

describe('/lib/publish.js', function() {

  afterEach(mockRequest.reset.bind(mockRequest));

  it('should publish name', function* () {
    var obj = require(join(fixtures, 'publish.json'));
    mockRequest.mock(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* publish({
      cwd: join(fixtures, 'publish')
    }, config);
    mockRequest.callCount.should.eql(2);
    var args1 = mockRequest.calls[0].arguments[0];
    args1.url.should.eql('http://spmjs.io/repository/tmp/1.0.0/');
    args1.method.should.eql('POST');
    (args1.force === undefined).should.be.true;
    args1.headers['Authorization'].should.eql('Yuan 12345');
    args1.json.should.eql({
      name: 'tmp',
      version: '1.0.0',
      spm: {
        dependencies: {
          position: '1.1.0'
        }
      },
      tag: 'stable',
      readme: '',
      dependencies: ['position@1.1.0']
    });

    var args2 = mockRequest.calls[1].arguments[0];
    args2.url.should.eql('http://spmjs.io/repository/tmp/1.0.0/');
    args2.method.should.eql('PUT');
    (args2.force === undefined).should.be.true;
    args2.headers['Authorization'].should.eql('Yuan 12345');
    args2.headers['content-type'].should.eql('application/x-tar');
    args2.headers['content-encoding'].should.eql('gzip');
    should.exist(args2.headers['content-length']);
    should.exist(args2.headers['x-package-md5']);

    res.should.eql(obj);
  });

  it('should throw when package is invalid', function*() {
    var err, cwd;
    try {
      cwd = join(fixtures, 'publish-miss-package');
      yield* publish({cwd: cwd});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('package.json not found');

    try {
      cwd = join(fixtures, 'publish-miss-name');
      yield* publish({cwd: cwd});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('name key is missing');

    try {
      err = undefined;
      cwd = join(fixtures, 'publish-miss-version');
      yield* publish({cwd: cwd});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('version key is missing');

    try {
      err = undefined;
      cwd = join(fixtures, 'publish-invalid-version');
      yield* publish({cwd: cwd});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('version stable is invalid');

    try {
      err = undefined;
      cwd = join(fixtures, 'publish-invalid-name');
      yield* publish({cwd: cwd});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('name is invalid, should match /^[a-z][a-z0-9\\-\\.]*$/i');

    try {
      err = undefined;
      cwd = join(fixtures, 'publish-miss-spm');
      yield* publish({cwd: cwd});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('spm key is missing');
  });

  it('should throw when publish private package', function*() {
    var err, cwd;
    try {
      cwd = join(fixtures, 'publish-private');
      yield* publish({cwd: cwd}, {registry: 'http://spmjs.io'});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('it\'s private package, can\'t publish to http://spmjs.io');
  });
});
