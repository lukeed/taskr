> New Generation Build System

[![][fly-badge]][fly]
[![][dl-badge]][npm-pkg-link]
![][mit-badge]
[![][TravisLogo]][Travis]




<p align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=300px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
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

_Fly_ is a [build system](https://en.wikipedia.org/wiki/Build_automation) for [Node](https://nodejs.org/) based in [ES6](http://www.ecma-international.org/ecma-262/6.0/index.html) [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that aims to be simple and elegant to write and extend.

See the [Documentation](/docs/README.md) page to learn more.

## Usage
### Install

```
npm install fly
```

### _Flyfile_

```js
const paths = {
  scripts: ["src/**/*.js", "!src/ignore/**/*.js"]
}

exports.default = function* () {
  yield this.tasks.clean()
  yield this.tasks.scripts()
  yield this.watch([paths.scripts])
}

exports.clear = function* () {
  yield this.clear("build")
}

exports.scripts = function* () {
  yield this
    .source(paths.scripts)
    .babel({/* options */})
    .uglify({/* options */})
    .concat("all.min.js")
    .target("build/js")
}
```

# Contributing

Contributions are absolutely welcome. Check out our [contribution guide](/CONTRIBUTING.md).

# Roadmap ✈

+ Proper tests.
+ Configuration options (disable plugin auto-loading, etc.)

# License


[MIT](http://opensource.org/licenses/MIT) © [Jorge Bucaran][Author] et [al](https://github.com/flyjs/fly/graphs/contributors)



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/flyjs/fly/trend.png)](https://bitdeli.com/free "Bitdeli Badge")


[author]: http://about.bucaran.me

[fly]: https://www.github.com/flyjs/fly

[fly-badge]: https://img.shields.io/badge/fly-JS-05B3E1.svg?style=flat-square
[mit-badge]: https://img.shields.io/badge/license-MIT-444444.svg?style=flat-square

[npm-pkg-link]: https://www.npmjs.org/package/fly

[dl-badge]: http://img.shields.io/npm/dm/fly.svg?style=flat-square

[TravisLogo]: http://img.shields.io/travis/flyjs/fly.svg?style=flat-square
[Travis]: https://travis-ci.org/flyjs/fly
