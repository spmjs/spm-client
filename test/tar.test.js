'use strict';

require('should');
var join = require('path').join;
var archive = require('ls-archive');
var tar = require('../lib/tar');
var rimraf = require('rimraf').sync;
var rename = require('fs').renameSync;

describe('tar', function() {

  var dir = join(__dirname, './fixtures/tar');
  var tarfile = join(__dirname, './fixtures/tar.tar.gz');

  beforeEach(function() {
    rename(join(dir, 'gitignore'), join(dir, '.gitignore'));
  });

  afterEach(function() {
    rename(join(dir, '.gitignore'), join(dir, 'gitignore'));
  });

  it('normal', function(done) {

    tar.create(dir, tarfile, function(err, target) {

        archive.list(target, function(err, files) {
          files = files.map(function(f) {
            return f.path;
          });
          files.should.be.eql(['index.js', 'lib/index.js', 'package.json']);
          rimraf(tarfile);
          done();
        });
      });
  });
})
