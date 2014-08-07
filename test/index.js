'use strict';

describe('/lib/index.js', function() {

  it('exports', function() {
    var client = require('..');
    client.config.should.equal(require('../lib/config'));
    client.publish.should.equal(require('../lib/publish'));
    client.unpublish.should.equal(require('../lib/unpublish'));
    client.login.should.equal(require('../lib/login'));
    client.install.should.equal(require('../lib/install'));
    client.info.should.equal(require('../lib/info'));
    client.search.should.equal(require('../lib/search'));
  });
});
