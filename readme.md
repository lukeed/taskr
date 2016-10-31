# fly

[![](https://img.shields.io/travis/flyjs/fly.svg)](https://travis-ci.org/flyjs/fly)
[![Build status: Windows](https://ci.appveyor.com/api/projects/status/github/flyjs/fly?svg=true)](https://ci.appveyor.com/project/lukeed/fly)
[![](http://img.shields.io/npm/dm/fly.svg)](https://npmjs.org/package/fly)
[![](https://img.shields.io/npm/v/fly.svg)](https://npmjs.org/package/fly)

Node.js build system based in [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*).

## Features

* Based in [_co_-routines](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127), [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
* [Callback _heaven_](http://jakearchibald.com/2014/es7-async-functions/)
* [Concurrent tasks](https://github.com/flyjs/fly/tree/v1.4.1/docs/README.md#features)
* [Robust error handling](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127)
* [Cascading tasks](https://github.com/flyjs/fly/blob/v1.4.1/CHANGELOG.md#cascading-tasks)
* Tiny [API](https://github.com/flyjs/fly/blob/v1.4.1/docs/README.md#api).

See the [documentation](https://github.com/flyjs/fly/blob/v1.4.1/docs/README.md) to learn more.

> Note: Documentation reflects the latest stable release, [v1.4.1](https://github.com/flyjs/fly/releases/tag/v1.4.1). Documentation for v2 will be available soon.

## Install

```
npm install fly
```

## flyfile.js

### ES5

Out of the box, a `flyfile.js` should be written in native ES5:

```js
var x = module.exports
var paths = {
  scripts: ['src/**/*.js', '!src/ignore/**/*.js']
}

x.default = function * () {
  yield this.watch(paths.scripts, 'build')
}

x.build = function * () {
  yield this.source(paths.scripts)
    .eslint({
      rules: {'no-extra-semi': 0}
    })

  yield this.source(paths.scripts)
    .babel({
      presets: ['es2015', 'stage-0']
    })
    .concat('app.js')
    .target('dist')
}
```

### ES2015 and beyond

If you'd prefer to write your [`flyfile.js`](https://github.com/flyjs/fly/blob/v1.4.1/docs/README.md#flyfiles) and [plugins](https://github.com/flyjs/fly/blob/v1.4.1/docs/README.md#plugins) with ES6 or ES7 syntax, install [fly-esnext](https://github.com/lukeed/fly-esnext) and that's it :)

```
npm i -D fly-esnext
```

```js
const paths = {
  scripts: ['src/**/*.js', '!src/ignore/**/*.js']
}

export default async function () {
  await this.watch(paths.scripts, 'build')
}

export async function build() {
  await this.source(paths.scripts)
    .eslint({
      rules: {'no-extra-semi': 0}
    })

  await this.source(paths.scripts)
    .babel({
      presets: ['es2015', 'stage-0']
    })
    .concat('app.js')
    .target('dist')
}
```

