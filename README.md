# spm-client [![Build Status](https://travis-ci.org/spmjs/spm-client.png?branch=master)](https://travis-ci.org/spmjs/spm-client) [![Coverage Status](https://coveralls.io/repos/spmjs/spm-client/badge.png?branch=master)](https://coveralls.io/r/spmjs/spm-client?branch=master) 

spm client api

---

## Install

```
$ npm install spm-client -g
```

## Usage

```
var client = require('spm-client');

// global configuration
client.config({
  registry: 'http://registry.spmjs.io',
  auth: ''
})

// install seajs
client.install({name: 'seajs'}, function(err) {
  console.log(err);
});

// overwrite global config
client.install({name: 'seajs'}, {registry: 'http://proxy.spmjs.io'}, function(err) {
  console.log(err);
});
```

## API

### config

Global configuration

- registry
- auth
- temp

### install

Install modules, arguments

- name
- cwd
- dest
- force
- save
- saveDev

### search

Search modules, arguments

- name

### info

Get module info, arguments

- name

### publish

Publish module, arguments

- cwd
- tag

### unpublish

Unpublish modules, arguments

- name

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
