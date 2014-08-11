'use strict';

require('should');
var join = require('path').join;
var spmrc = require('spmrc');
spmrc.spmrcfile = join(__dirname, 'fixtures', 'spmrc');
var config = require('../lib/config');

describe('/lib/config.js', function() {

  afterEach(config.reset);

  it('should get default from spmrc', function() {
    var ret = config();
    Object.keys(ret).should.eql(['registry', 'global_registry', 'proxy', 'auth', 'temp', 'cache']);
    ret.registry.should.equal('http://default.registry.com');
    ret.auth.should.equal('defaultauth');
    ret.proxy.should.equal('defaultproxy');
  });

  it('should overwrite key', function() {
    config({
      registry: 'http://spmjs.io',
      auth: '',
      proxy: null
    });
    var ret = config();
    Object.keys(ret).should.eql(['registry', 'global_registry', 'proxy', 'auth', 'temp', 'cache']);
    ret.registry.should.equal('http://spmjs.io');
    ret.auth.should.equal('');
    ret.proxy.should.equal('defaultproxy');
  });

  it('should not write unmatched key', function() {
    config({a: 1});
    var ret = config();
    Object.keys(ret).should.eql(['registry', 'global_registry', 'proxy', 'auth', 'temp', 'cache']);
  });

  it('should reset defaults', function() {
    config({
      registry: 'http://spmjs.io'
    });
    var ret = config();
    ret.registry.should.equal('http://spmjs.io');

    config.reset();
    ret = config();
    ret.registry.should.equal('http://default.registry.com');
    ret.auth.should.equal('defaultauth');
    ret.proxy.should.equal('defaultproxy');
  });
});
