# History

---

## 0.4.2

- feat(install): _ is allowed in pkg name

## 0.4.1

- fix: path on Windows will not transform

## 0.4.0

- deps: 6to5 -> babel-core
- feat(info): support *

## 0.3.7

- fix(info) sort with semver.lt, Fix [spmjs/spmjs.io#118](https://github.com/spmjs/spmjs.io/issues/118)

## 0.3.6

- feat(publish) check main file exist before publish
- feat(publish) name must be in lowercase, [#35](https://github.com/spmjs/spm-client/issues/35)

## 0.3.5

- fix(install) create package.json when install --save, [spmjs/spm#1183](https://github.com/spmjs/spm/issues/1183)

## 0.3.4

- fix(bin) only compile files in spm-client/bin and spm-client/lib

## 0.3.3

- fix(bin) use 6to5 instead of gnode

## 0.3.2

- fix(bin) also miss ali.gnode, should be gnode

## 0.3.1

- fix(bin) miss bin in package.json

## 0.3.0

- feat(bin) simple bin for client
- feat(install) log registry when install
- fix(install) save don't work when pkg is found and version is supplied, Fix [spmjs/spm#1144](https://github.com/spmjs/spm/issues/1144)
- deps: ali.gnode -> gnode

## 0.2.11

fix(install) getVersion error, Fix [#31](https://github.com/spmjs/spm-client/issues/31)

## 0.2.10

fix(install) check semver match before info

## 0.2.9

- use gnode instead of regenerator
- fix(install) do info first, Fix https://github.com/spmjs/spm/issues/1107

## 0.2.8

don't read .gitignore when have .spmignore

## 0.2.7

fix missing gulp when no harmony

## 0.2.6

use vinyl-fs instead of gulp

## 0.2.5

more info in install error

## 0.2.4
- improve print log
- print versions when spm info not specify version

## 0.2.3

- client.config read spmrc by default
- fix tar pack using inherits@1.0.0
- add more default ignore files when tar
- use spy for testcase

## 0.2.2

- log tarfile size
- args priority (args > config > global config)

## 0.2.1

- name support array (install)
- check package and spm key (publish)
- base -> cwd (install)
- resolve cwd (install and publish)

## 0.2.0

support harmony generator

## 0.1.0

First version
