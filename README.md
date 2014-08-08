# spm-client 

[![NPM version](https://img.shields.io/npm/v/spm-client.svg?style=flat)](https://npmjs.org/package/spm-client)
[![Build Status](https://img.shields.io/travis/spmjs/spm-client.svg?style=flat)](https://travis-ci.org/spmjs/spm-client)
[![Build Status](https://img.shields.io/coveralls/spmjs/spm-client.svg?style=flat)](https://coveralls.io/r/spmjs/spm-client)
[![NPM downloads](http://img.shields.io/npm/dm/spm-client.svg?style=flat)](https://npmjs.org/package/spm-client)

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

### login

login spmjs.io

- username
- authKey

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
