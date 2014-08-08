'use strict';

var should = require('should');
var mock = require('./support/mock').require('co-request');
var request = require('../lib/request');

describe('/lib/request.js', function() {

  afterEach(mock.restore.bind(mock));

  describe('arguments', function() {

    beforeEach(mock.intercept.bind(mock, response));

    it('should request', function* () {
      yield* request({
        url: 'http://spmjs.io/repository/arale-cookie/',
        method: 'GET'
      });
      mock.callCount.should.eql(1);
      var args = mock.callCache[0].arguments[0];
      args.url.should.eql('http://spmjs.io/repository/arale-cookie/');
      args.method.should.eql('GET');
      Object.keys(args.headers).should.eql(['user-agent', 'Accept-Language']);
      Object.keys(args).should.eql(['url', 'method', 'headers', 'gzip']);
    });

    it('should has header `Authorization`', function* () {
      yield* request({
        url: 'http://spmjs.io/repository/arale-cookie/',
        method: 'GET',
        auth: '12345'
      });
      mock.callCount.should.eql(1);
      var args = mock.callCache[0].arguments[0];
      args.headers['Authorization'].should.eql('Yuan 12345');
      Object.keys(args.headers).should.eql(['user-agent', 'Accept-Language', 'Authorization']);
      Object.keys(args).should.eql(['url', 'method', 'headers', 'gzip']);
    });

    it('should has header `X-Yuan-Force`', function* () {
      yield* request({
        url: 'http://spmjs.io/repository/arale-cookie/',
        method: 'GET',
        force: true
      });
      mock.callCount.should.eql(1);
      var args = mock.callCache[0].arguments[0];
      args.headers['X-Yuan-Force'].should.eql('true');
      Object.keys(args.headers).should.eql(['user-agent', 'Accept-Language', 'X-Yuan-Force']);
      Object.keys(args).should.eql(['url', 'method', 'force', 'headers', 'gzip']);
    });
  });

  it('should throw when request ECONNREFUSED', function* () {
    mock.intercept(function() {
      var err = new Error('connect refused');
      err.code = 'ECONNREFUSED';
      throw err;
    });

    var err;
    try {
      yield* request({
        url: 'http://spmjs.io/repository/arale-cookie/',
        method: 'GET'
      });
    } catch(e) {
      err = e;
    }
    mock.callCount.should.eql(1);
    should.exist(err);
    err.code.should.eql('ECONNREFUSED');
  });

  it('should throw when request ENOTFOUND', function* () {
    mock.intercept(function() {
      var err = new Error('connect refused');
      err.code = 'ENOTFOUND';
      throw err;
    });

    var err;
    try {
      yield* request({
        url: 'http://spmjs.io/repository/arale-cookie/',
        method: 'GET'
      });
    } catch(e) {
      err = e;
    }
    mock.callCount.should.eql(1);
    should.exist(err);
    err.code.should.eql('ENOTFOUND');
  });
});

function response() {
  return function(callback) {
    callback(null, {body: {}, headers: {}});
  };
}
