> New Generation Build System

<div align="center">
  <a href="http://github.com/flyjs">
    <img width=280px src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>
<br>

<p align="center"><big>

</big></p>

<p align="center">
  <a href="https://npmjs.org/package/fly">
    <img src="https://img.shields.io/npm/v/fly.svg?style=flat-square"
         alt="NPM Version">
  </a>

  <a href="https://coveralls.io/r/flyjs/fly">
    <img src="https://img.shields.io/coveralls/flyjs/fly.svg?style=flat-square"
         alt="Coverage Status">
  </a>

  <a href="https://travis-ci.org/flyjs/fly">
    <img src="https://img.shields.io/travis/flyjs/fly.svg?style=flat-square"
         alt="Build Status">
  </a>

  <a href="https://npmjs.org/package/fly">
    <img src="http://img.shields.io/npm/dm/fly.svg?style=flat-square"
         alt="Downloads">
  </a>

  <a href="https://david-dm.org/flyjs/fly.svg">
    <img src="https://david-dm.org/flyjs/fly.svg?style=flat-square"
         alt="Dependency Status">
  </a>

  <a href="https://github.com/flyjs/fly/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/fly.svg?style=flat-square"
         alt="License">
  </a>
</p>

<p align="center">
  <b><a href="#about">About</a></b>
  |
  <b><a href="#usage">Usage</a></b>
  |
  <b><a href="/docs/README.md">Documentation</a></b>
  |
  <b><a href="https://github.com/flyjs/fly/wiki#plugins">Plugins</a></b>
  |
  <b><a href="#contributing">Contributing</a></b>

  <p align="center">
    <a href="https://gitter.im/flyjs/fly?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge">
      <img src="https://badges.gitter.im/Join%20Chat.svg">
    </a>
  </p>
</p>

<br>

## About

_Fly_ is a modern [build system](https://en.wikipedia.org/wiki/Build_automation) for [Node](https://nodejs.org/) based in [_co_-routines](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127), [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

_Fly_ has [callback _heaven_](http://jakearchibald.com/2014/es7-async-functions/), [concurrent tasks](https://github.com/flyjs/fly/blob/master/docs/README.md#features), [robust error handling](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127), [cascading tasks](https://github.com/flyjs/fly/blob/master/CHANGELOG.md#cascading-tasks) and a simple [API](https://github.com/flyjs/fly/blob/master/docs/README.md#api).

See the [documentation](/docs/README.md) to learn more about Fly.

## Usage
### Install

```
npm install fly
```

### _Flyfile_

> Flyfiles can be written in ES5/[6][es6-example]/[7][es7-example] and [other](https://github.com/jashkenas/coffeescript/wiki/List-of-languages-that-compile-to-JS) variants.

```js
const paths = {
  scripts: ["src/**/*.js", "!src/ignore/**/*.js"]
}

export default function* () {
  yield this.watch(paths.scripts, "build")
}

export function* build () {
  yield this.clear("dist")
  yield this
    .source(paths.scripts)
    .babel({ stage: 0, sourceMap: true })
    .uglify()
    .concat("app.js")
    .target("dist")
}
```

# Contributing

Contributions are _absolutely_ welcome. Check out our [contribution guide](/CONTRIBUTING.md).

# License

[MIT](http://opensource.org/licenses/MIT) © [Jorge Bucaran][Author] et [al][contributors]
:heart:

[author]:         http://github.com/bucaran
[contributors]:   https://github.com/flyjs/fly/graphs/contributors

[fly]:            https://www.github.com/flyjs/fly

[npm-pkg-link]:   https://www.npmjs.org/package/fly
[npm-ver-link]:   https://img.shields.io/npm/v/fly.svg?style=flat-square

[dl-badge]:       http://img.shields.io/npm/dm/fly.svg?style=flat-square

[travis-badge]:   http://img.shields.io/travis/flyjs/fly.svg?style=flat-square
[travis-link]:    https://travis-ci.org/flyjs/fly

[mit-badge]:      https://img.shields.io/badge/license-MIT-444444.svg?style=flat-square

[es6-example]:    https://github.com/flyjs/fly/blob/master/examples/Flyfile.babel.js
[es7-example]:    https://github.com/flyjs/fly/blob/master/examples/async/Flypath.babel.js
