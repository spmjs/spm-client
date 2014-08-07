'use strict';

require('should');
var config = require('../lib/config');

describe.only('/lib/config.js', function() {

  afterEach(config.reset);

  it('should get default', function() {
    var ret = config();
    Object.keys(ret).should.eql(['registry', 'proxy', 'auth', 'temp']);
    (ret.registry === undefined).should.be.true;
    (ret.proxy === undefined).should.be.true;
    (ret.auth === undefined).should.be.true;
  });

  it('should overwrite key', function() {
    config({
      registry: 'http://spmjs.io',
      auth: '',
      proxy: null
    });
    var ret = config();
    Object.keys(ret).should.eql(['registry', 'proxy', 'auth', 'temp']);
    ret.registry.should.equal('http://spmjs.io');
    ret.auth.should.equal('');
    (ret.proxy === undefined).should.be.true;
  });

  it('should not write unmatched key', function() {
    config({a: 1});
    var ret = config();
    Object.keys(ret).should.eql(['registry', 'proxy', 'auth', 'temp']);
  });

  it('should reset defaults', function() {
    config({
      registry: 'http://spmjs.io'
    });
    var ret = config();
    ret.registry.should.equal('http://spmjs.io');

    config.reset();
    ret = config();
    (ret.registry === undefined).should.be.true;
    (ret.proxy === undefined).should.be.true;
    (ret.auth === undefined).should.be.true;
  });
});
