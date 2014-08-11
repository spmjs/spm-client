'use strict';

require('should');
var join = require('path').join;
var mockRequest= require('spy').require('co-request');
var unpublish = require('../lib/unpublish');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io',
  auth: '12345'
};

describe('/lib/unpublish.js', function() {

  afterEach(mockRequest.reset.bind(mockRequest));

  it('should unpublish name', function* () {
    var obj = require(join(fixtures, 'unpublish.json'));
    mockRequest.mock(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* unpublish({
      name: 'tmp'
    }, config);
    mockRequest.callCount.should.eql(1);
    var args = mockRequest.calls[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/tmp/');
    args.method.should.eql('DELETE');
    args.headers['Authorization'].should.eql('Yuan 12345');
    res.should.eql(obj);
  });

  it('should unpublish name@version', function* () {
    var obj = require(join(fixtures, 'unpublish.json'));
    mockRequest.mock(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* unpublish({
      name: 'tmp',
      version: '1.0.0'
    }, config);
    mockRequest.callCount.should.eql(1);
    var args = mockRequest.calls[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/tmp/1.0.0/');
    args.method.should.eql('DELETE');
    args.headers['Authorization'].should.eql('Yuan 12345');
    res.should.eql(obj);
  });
});
