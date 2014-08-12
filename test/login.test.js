'use strict';

require('should');
var join = require('path').join;
var mockRequest = require('spy').require('co-request');
var login = require('../lib/login');

var fixtures = join(__dirname, 'fixtures');
var config = {
  registry: 'http://spmjs.io'
};

describe('/lib/login.js', function() {

  afterEach(mockRequest.reset.bind(mockRequest));

  it('should login', function* () {
    var obj = require(join(fixtures, 'login.json'));
    mockRequest.mock(function* () {
      /* jshint noyield: true */
      return {
        headers: {},
        body: obj,
        statusCode: 200
      };
    });
    var res = yield* login({
      username: 'arale',
      authkey: '12345'
    }, config);
    mockRequest.callCount.should.eql(1);
    var args = mockRequest.calls[0].arguments[0];
    args.url.should.eql('http://spmjs.io/account/login/');
    args.method.should.eql('POST');
    args.json.should.eql({
      account: 'arale',
      authkey: '12345'
    });
    args.should.have.property('json');
    res.should.eql(obj);
  });

  it('should throw when miss param', function* () {
    var err;
    try {
      yield* login();
    } catch(e) {
      err = e;
    }
    err.message.should.eql('Missing parameters.');

    err = undefined;
    try {
      yield* login({username: 'aa'});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('Missing parameters.');

    err = undefined;
    try {
      yield* login({authkey: '12345'});
    } catch(e) {
      err = e;
    }
    err.message.should.eql('Missing parameters.');
  });
});
