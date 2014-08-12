# spm-client 

[![NPM version](https://img.shields.io/npm/v/spm-client.svg?style=flat)](https://npmjs.org/package/spm-client)
[![Build Status](https://img.shields.io/travis/spmjs/spm-client.svg?style=flat)](https://travis-ci.org/spmjs/spm-client)
[![Coverage Status](https://img.shields.io/coveralls/spmjs/spm-client.svg?style=flat)](https://coveralls.io/r/spmjs/spm-client)
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
  auth: '12345'
})

// install seajs
client.install({name: 'seajs'}, function(err) {
  console.log(err);
});

// overwrite global config
client.install({name: 'seajs'}, {registry: 'http://your-registry'}, function(err) {
  console.log(err);
});
```

## API

### config

Global configuration

* registry: registry url of yuan server
* global_registry: global registry, others are private
* proxy: an HTTP proxy, pass to request
* auth:  the authKey that copied from spmjs accout page
* temp: the temp directory

### login

Login spmjs.io, arguments below

* username: the username of registry
* authkey: the authKey that copied from spmjs accout page

### install

Install a package, arguments below

* name: the package name, can also be name@version
* cwd: the dependencies of the package in the cwd will be installed, use it when name isn't specified
* destination: the directory that install to
* force: force download packages from registry, no cache
* save: save name to package.dependencies
* saveDev: save name to package.devDependencies

### search

Search a package, arguments below

* name: search packages with your query name

### info

Get package info, arguments below

* name: the package name
* version: the package version

### publish

Publish a package, arguments below

* cwd: where is your package
* tag: publish with a given tag that you can install by name@tag, default is stable
* force: force publish when the package exists

### unpublish

Unpublish a package, arguments below

* name: the package name
* version: the package version

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
