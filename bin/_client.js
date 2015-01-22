'use strict';

var debug = require('debug')('spm-client:bin');
var path = require('path');
var minimist = require('minimist');
var colorful = require('colorful');
var commands = [
  'install',
  'info',
  'search',
  'publish',
  'unpublish'
];

var argv = minimist(process.argv.slice(2));
debug(argv);
console.log();

if (argv.h || argv.help) {
  return showHelp();
}

var subCommand = argv['_'][0];
if (commands.indexOf(subCommand) === -1) {
  return console.error(colorful.red('Command `%s` not found.', subCommand));
}

var client = require('..');
var pkg = require(path.join(process.cwd(), 'package.json'));
if (pkg.spm && pkg.spm.registry) {
  client.config({'registry': pkg.spm.registry});
}

var co = require('co');
co(function*() {
  var result = yield client[subCommand](argv);
  if (result) {
    try {
      result = JSON.stringify(result, null, 2);
      console.log(result);
    } catch(e) {}
  }
  console.log();
  console.info(colorful.green('Run `spm-client %s` success'), subCommand);
}).then();

function showHelp() {
  console.info(colorful.cyan('Command and arguments will pass to api directly, you can find arguments in API document'));
  console.info(colorful.cyan('See document: https://github.com/spmjs/spm-client'));
}
