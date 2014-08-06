'use strict';

module.exports = require('generator-supported') ?
  require('./lib') :
  require('./build');
