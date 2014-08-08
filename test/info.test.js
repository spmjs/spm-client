'use strict';

var join = require('path').join;
var should = require('should');
var mock = require('./support/mock').require('co-request');
var info = require('../lib/info');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io',
  auth: '12345'
};

describe('/lib/info.js', function() {

  afterEach(mock.restore.bind(mock));

  it('should get info by name', function* () {
    var obj = require(join(fixtures, 'package-with-name.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* info({
      name: 'arale-cookie'
    }, config);
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/arale-cookie/');
    args.should.have.property('json');
    res.should.eql(obj.packages['1.1.0']);
  });

  it('should not packages info by name', function* () {
    var obj = require(join(fixtures, 'package-with-name.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* info({
      name: 'arale-cookie'
    }, config);
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/arale-cookie/');
    args.should.have.property('json');
    res.should.eql(obj.packages['1.1.0']);
  });

  it('should get info by name@version', function* () {
    var obj = require(join(fixtures, 'package-with-name-version.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* info({
      name: 'arale-cookie',
      version: '1.1.0'
    }, config);
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/arale-cookie/1.1.0/');
    res.should.eql(obj);
  });

  it('should get info by name@tag', function* () {
    var obj = require(join(fixtures, 'package-with-tag.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* info({
      name: 'tmp',
      version: 'test'
    }, config);
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/tmp/');
    res.should.eql(obj.packages['0.0.1']);
  });

  it('should get error when no matched tag', function* () {
    var obj = require(join(fixtures, 'more-packages.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var err;
    try {
      yield* info({
        name: 'tmp',
        version: 'noexisttag'
      }, config);
    } catch(e) {
      err = e;
    }
    should.exist(err);
    err.message.should.eql('no matched package tmp ~ noexisttag');
  });

  it('should get the lastest version', function* () {
    var obj = require(join(fixtures, 'more-packages.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* info({
      name: 'tmp'
    }, config);
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/tmp/');
    res.should.eql(obj.packages['0.0.2']);
  });

  it('should get the version in package', function* () {
    var obj = require(join(fixtures, 'more-packages-with-version.json'));
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* info({
      name: 'tmp'
    }, config);
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/tmp/');
    res.should.eql(obj.packages['0.0.2']);
  });

  it('should throw when statusCode>=500', function* () {
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        statusCode: 500
      };
    });
    var err;
    try {
      yield* info({name: 'tmp'}, config);
    } catch(e) {
      err = e;
    }
    err.message.should.eql('Server error');
  });

  it('should throw when statusCode>=401', function* () {
    mock.intercept(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        statusCode: 401,
        body: {
          message: 'Authorization required.'
        }
      };
    });
    var err;
    try {
      yield* info({name: 'tmp'}, config);
    } catch(e) {
      err = e;
    }
    err.message.should.eql('Authorization required.');
  });
});
