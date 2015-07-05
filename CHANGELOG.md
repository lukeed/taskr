<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=120px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
  </a>
</div>

# Changelog
+ [v0.1.6](#v0.1.6)
+ [v0.1.5](#v0.1.5)
+ [v0.1.4](#v0.1.4)
+ [v0.1.3](#v0.1.3)
+ [v0.1.2](#v0.1.2)
+ [v0.1.1](#v0.1.1)
+ [v0.1.0](#v0.1.0)
  + [Multi-Flyfile Support](multi-flyfile-support)
  + [Plugins API update](plugins-api-update)
  + [`watch` API update](watch-api-update)
+ [v0.0.1](#0.0.1)

## v0.1.6

+ Fly now uses your module _actual_ default export as its `default` task. Before you needed to name your task `default` explicitly which is fine the CommonJS syntax:

```js
exports.default = function* () {}
```

But was problematic in the ES6~ syntax since `default` is a reserved word in JavaScript. Now it's _also_ possible to do:

```js
module.exports = function* () {}
```

Which is specially useful if you write your Flyfiles in the ES6/7 syntax:

```js
export default function* () {}
```

## v0.1.5

+ Fix bug in `util.error`, where function's argument `error` was shadowing function name `error`. :feelsgood:

+ Fix bug in `util.find/hook` that was still breaking the require hook for some type of files. Basically the problem is `jsVariant` either exposes an array with dependencies that should be loaded or a string. In the case of arrays its contents could be strings or object literals with a `module` property. The following check patches this:

```js
require(modules[0].module
  ? modules[0].module
  : modules[0])
```

> Note to Earl Gray users: `interpret@0.6.2` does not support earl at the moment. Please refer to [this PR](https://github.com/tkellen/js-interpret/pull/31). Make sure to install both `earlgray` and `earlgray-runtime` if you are using `Flyfile.eg` files. See `examples/Flyfile.eg` for an Earl Gray Flyfile example.

## v0.1.4

+ Fix bug in `util.find/hook` where jsVariants that expose the transformer module name using an array without a `module` property was being called causing Flyfiles in languages other than ES5/6/7 to fail.

## v0.1.3

+ Revise CLI engine, minor refactoring.
+ Fixed critical bug in `util.plugins` where CLI engine was failing to load if there were no listed plugins.

## v0.1.2

+ Bug fix: Rename `main` in `package.json` from `dist/index` to `dist/index.json`.

## v0.1.1

+ Now Fly uses Fly to build itself. See `Flyfile.babel.js` at the root of the proejct.

+ Improved error tracing.

  > This should be useful during development. In the future advanced error tracing should be configurable via `process.env.DEVELOPMENT `.

  <img width=600px src="https://cloud.githubusercontent.com/assets/8317250/8506916/db8b2eaa-2266-11e5-8395-74ba0c63da24.png">


+ Add consistent support for multiple Node versions.

+ Support Flyfile, flyfile, Flypath and flypath mapped to all the available `jsVariant` [extensions](https://github.com/tkellen/js-interpret#extensions) by default when you run `fly` on the command line.

Before you had to use `fly -f path/to/file` in order to run a specific Flyfile. You can still use `-f`, but _now_ Fly will automatically attempt to load Flyfiles based in the extension autoamtically.

+ Improve handling of globs by allowing nested arrays (See `util.flatten`).

+ Improve documentation and revise CONTRIBUTING.md

## v0.1.0

+ ### Multi-Flyfile Support
  Fly now supports Flyfiles written in other languages that can compile to JavaScript. CoffeeScript, TypeScript, ES6, ES7, etc. Examples are provided in the `examples/` directory. ES6 and ES7 is supported out of the box. For other languages you must make sure to install the corresponding `transformer` module. See [here](https://github.com/jashkenas/coffeescript/wiki/List-of-languages-that-compile-to-JS).

  While `exports.default = function* () { ... }` is valid JavaScript, `export function* default () { ... }` will cause a runtime error. Therefore, an alias was added to `default`, now you can write your default task as `main`:

  ```js
  export async function main () {
    await this.clear("dist")
    this.watch(paths, tasks)
  }
  ```

+ ### Plugins API update
  A simple transform plugin _before_:

  ```js
  module.exports = function () {
    this.myPlugin = function (opts) {
      return this.filter((src) => require("...")(src, opts))
    }
  }
  ```

  As discussed in [#6](https://github.com/flyjs/fly/issues/6) and chat rooms the previous style has some of the following disadvantages:

  + More verbose.
  + Difficult to check whether filter already exist or not.
  + Difficult to control report notifications from inside Fly.

  _Now_:
  ```js
  module.exports = function () {
    this.filter("myPlugin", (src, opts) => require("..")(src, opts))
  }
  ```

  This new plugin style is highly encouraged.

+ ### `watch` API update

  _Before_, one would create a `default` task and invoke `watch` at the end of the function, but this would cause an circular dependency issue.

  The problem was resolved making the assumption the user would never modify its globs, so `watch` was acting essentially like a singleton-like at a class instance level in order to prevent calling `watch` again, so in fact `watch` was only called once.

  _Now_, one still creates a `default` or `watch` task and the `Fly.prototype.watch` method only registers the watch observers and triggers the first round of tasks specified as the second array argument.

  The following causes the specified `tasks` to be executed immediately.

  ```js
  exports.default = function* () {
    // yield ...
    this.watch([globs], [tasks])
  }
  ```

  A more contrived example:

  ```js
  exports.default = function* () {
    this.watch(
      ["babel/src/*.js", "map/src/*", "coffee/src/**/*.coffee"],
      ["lint", "test", "clear", "grind", "map", "babel"])
  }
  ```

+ Fixed bug in `util.plugins` where reduce was not setting the initial value correctly. Thanks to [jigsaw](https://github.com/e-jigsaw).

## v0.0.1

+ Fly initial commit
