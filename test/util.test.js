'use strict';

require('should');
var util = require('../lib/util');

describe('/lib/util.js', function() {

  it('should resolve id', function* () {
    util.resolveid('a@1.0.0').should.eql({
      name: 'a',
      version: '1.0.0'
    });
    util.resolveid('a@stable').should.eql({
      name: 'a',
      version: 'stable'
    });
    (util.resolveid('@1.0.0') === null).should.be.true;
    (util.resolveid('_@1.0.0') === null).should.be.true;
  });
});
