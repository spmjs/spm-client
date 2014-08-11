'use strict';

require('should');
var join = require('path').join;
var mockRequest = require('spy').require('co-request');
var search = require('../lib/search');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io',
  auth: '12345'
};

describe('/lib/search.js', function() {

  afterEach(mockRequest.reset.bind(mockRequest));

  it('should search', function* () {
    var obj = require(join(fixtures, 'search.json'));
    mockRequest.mock(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* search({
      name: 'arale'
    }, config);
    mockRequest.callCount.should.eql(1);
    var args = mockRequest.calls[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/search?q=arale');
    args.should.have.property('json');
    res.should.eql(obj);
  });
});
