'use strict';

module.exports = require('generator-supported') ?
  require('./lib') :
  /* istanbul ignore next */
  require('./build');
