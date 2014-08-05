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

配置全局参数

- registry
- auth
- temp

### install

安装模块，参数

- name
- cwd
- dest
- force
- save
- saveDev

### search

查询模块，参数

- name

### info

查询模块信息，参数

- name

### publish

发布模块，参数

- cwd
- tag

### unpublish

删除模块，参数

- name

## LISENCE

Copyright (c) 2014 popomore. Licensed under the MIT license.
