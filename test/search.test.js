'use strict';

require('should');
var join = require('path').join;
var mock = require('./support/mock').require('co-request');
var search = require('../lib/search');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io',
  auth: '12345'
};

describe('/lib/search.js', function() {

  afterEach(mock.restore.bind(mock));

  it('should search', function* () {
    var obj = require(join(fixtures, 'search.json'));
    mock.intercept(function* () {
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
    mock.callCount.should.eql(1);
    var args = mock.callCache[0].arguments[0];
    args.url.should.eql('http://spmjs.io/repository/search?q=arale');
    args.should.have.property('json');
    res.should.eql(obj);
  });
});
