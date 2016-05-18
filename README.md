# fly

[![](https://img.shields.io/travis/brj/fly.svg)](https://travis-ci.org/brj/fly)
[![](http://img.shields.io/npm/dm/fly.svg)](https://npmjs.org/package/fly)
[![](https://img.shields.io/npm/v/fly.svg)](https://npmjs.org/package/fly)

Generator-based build system.

## Features

* Based in [_co_-routines](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127), [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
* [Callback _heaven_](http://jakearchibald.com/2014/es7-async-functions/)
* [Concurrent tasks](https://github.com/flyjs/fly/blob/master/docs/README.md#features)
* [Robust error handling](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127)
* [Cascading tasks](https://github.com/flyjs/fly/blob/master/CHANGELOG.md#cascading-tasks) 
* Tiny [API](https://github.com/flyjs/fly/blob/master/docs/README.md#api).

See the [documentation](/docs/README.md) to learn more.

## Install

```
npm install fly
```

## *flyfile.js*

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

If you'd prefer to write your [`flyfile.js`](https://github.com/brj/fly/blob/master/docs/README.md#flyfiles) and [plugins](https://github.com/brj/fly/blob/master/docs/README.md#plugins) with ES6 or ES7 syntax, install [fly-esnext](https://github.com/lukeed/fly-esnext) and that's it :)

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

<div align="center">
<a href="https://github.com/brj/fly">
<img width=100px src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
</a>
</div>
