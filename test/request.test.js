'use strict';

var should = require('should');
var mockRequest = require('spy').require('co-request');
var request = require('../lib/request');

describe('/lib/request.js', function() {

  afterEach(mockRequest.reset.bind(mockRequest));

  describe('arguments', function() {

    beforeEach(mockRequest.mock.bind(mockRequest, response));

    it('should request', function* () {
      yield* request({
        url: 'http://spmjs.io/repository/arale-cookie/',
        method: 'GET'
      });
      mockRequest.callCount.should.eql(1);
      var args = mockRequest.calls[0].arguments[0];
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
      mockRequest.callCount.should.eql(1);
      var args = mockRequest.calls[0].arguments[0];
      args.headers['Authorization'].should.eql('Yuan 12345');
      Object.keys(args.headers).should.eql(['user-agent', 'Accept-Language', 'Authorization']);
      Object.keys(args).should.eql(['url', 'method', 'headers', 'gzip']);
    });
  });

  it('should throw when request ECONNREFUSED', function* () {
    mockRequest.mock(function() {
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
    mockRequest.callCount.should.eql(1);
    should.exist(err);
    err.code.should.eql('ECONNREFUSED');
  });

  it('should throw when request ENOTFOUND', function* () {
    mockRequest.mock(function() {
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
    mockRequest.callCount.should.eql(1);
    should.exist(err);
    err.code.should.eql('ENOTFOUND');
  });
});

function response() {
  return function(callback) {
    callback(null, {body: {}, headers: {}});
  };
}
