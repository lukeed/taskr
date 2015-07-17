> New Generation Build System

[![][fly-badge]][fly]
[![npm package][npm-ver-link]][fly]
[![][dl-badge]][npm-pkg-link]
[![][travis-logo]][travis]
![][mit-badge]


<p align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=280px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
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
  this.watch([paths.scripts], ["scripts"])
}

export function* scripts () {
  yield this.clear("build")
  yield this
    .source(paths.scripts)
    .babel({ stage: 0 })
    .uglify()
    .concat("all.min.js")
    .target("build/js")
}
```

# Contributing

Contributions are _absolutely_ welcome. Check out our [contribution guide](/CONTRIBUTING.md).

# License

[MIT](http://opensource.org/licenses/MIT) © [Jorge Bucaran][Author] et [al][contributors]
:heart:


[author]: http://about.bucaran.me
[fly]: https://www.github.com/flyjs/fly
[fly-badge]: https://img.shields.io/badge/fly-JS-05B3E1.svg?style=flat-square
[mit-badge]: https://img.shields.io/badge/license-MIT-444444.svg?style=flat-square
[npm-pkg-link]: https://www.npmjs.org/package/fly
[npm-ver-link]: https://img.shields.io/npm/v/fly.svg?style=flat-square
[dl-badge]: http://img.shields.io/npm/dm/fly.svg?style=flat-square
[travis-logo]: http://img.shields.io/travis/flyjs/fly.svg?style=flat-square
[travis]: https://travis-ci.org/flyjs/fly
[contributors]: https://github.com/flyjs/fly/graphs/contributors
[es6-example]: https://github.com/flyjs/fly/blob/master/examples/Flyfile.babel.js
[es7-example]: https://github.com/flyjs/fly/blob/master/examples/async/Flypath.babel.js
