<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=120px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>

# Changelog

+ [v0.3.4](#v034)
+ [v0.3.1](#v031)
+ [v0.3.0](#v030)
  + [Multitasking](#multitasking)
  + [New Examples](#new-examples)
+ [v0.2.0](#v020)
  + [Async Transformers](#async-transformers)
+ [v0.1.11](#v0111)
+ [v0.1.10](#v0110)
+ [v0.1.9](#v019)
+ [v0.1.8](#v018)
+ [v0.1.7](#v017)
  + [Cascading Tasks](#cascading-tasks)
+ [v0.1.6](#v016)
+ [v0.1.5](#v015)
+ [v0.1.4](#v014)
+ [v0.1.3](#v013)
+ [v0.1.2](#v012)
+ [v0.1.1](#v011)
+ [v0.1.0](#v010)
  + [Multi-Flyfile Support](#multi-flyfile-support)
  + [Plugins API update](#plugins-api-update)
  + [`watch` API update](#watch-api-update)
+ [v0.0.1](#v001)

## v0.3.4

+ New: Update to new logo:
<span>
<a href="http://github.com/flyjs/fly">
  <img width=50px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
</a>
</span>

+ Change: Use `--list=bare` to display tasks without using terminal styles instead of `--list=simple`.

+ New: add `.codeclimate.yml`

+ Bugfix: `spawn.js` was yielding a non yieldable expression causing fears to be eaten out by darkness.

+ Improve: Documentation greatly revised and some parts rewritten :heart:

+ Bugfix: `bin/index.js` was not correctly loading `fly-util` causing some runtime errors to crash Fly silently.

+ New: Reporter displays ms/sec appropriately. [#33](https://github.com/flyjs/fly/issues/33).


## v0.3.2

+ Bugifx: New error handling was supressing the `No Flyfile found...` message.

## v0.3.1

+ Bugfix: `package.json` was exporting `bin/index`, but it should have been `bin/index.js`

## v0.3.0

+ Refactor: `fly.js` largely **rewritten**. Sharper code, cleaner syntax, don't overuse recursive reducers. 5~10% less LOC.

+ Bugifx: ES7 using `async/await` now works as expected.

+ Bugfix: `cli/spawn.js` was crashing if no plugins were found inside `node_modules`.

+ Improve: Better error handling and stack tracing across Fly. No more _silent_ crashes.

+ Update: `reporter.js` and `fmt.js` to latest `fly-util`

+ Remove: `Flyfile.js` from root and use `Flyfile.babel.js` instead.

+ Improve: Documentation and code comments.

### Multitasking

+ Run tasks in parallel via `Fly.prototype.run([tasks], { parallel: true })`.

  Imagine you have 10 functions that implement an asynchronous transformation on a data source, each taking about 1 minute to complete. Assume these functions are truly async by relying on native extensions or Node's IO API.

  Assign each transform to a different task. If you run all tasks sequentially you will have to wait at least 10 minutes. If you run all tasks in parallel you will have to wait at least 1 minute.

  + See `examples/multi` for examples.

### New Examples

+ Examples are now organized in directories by category, such as `multi`, `async`, `maps`, `css`, `lint`, etc. Each directory contains one or more Flyfiles describing related tasks. To run the examples, install its dependencies first using _Fly_:

  ```
  fly -f examples/
  ```

  See [examples/README](https://github.com/flyjs/fly/blob/master/examples/README.md).


## v0.2.0

### Async Transformers

+ This version introduces direct API support to work with async transformers. For example, if you have a filter such as `myFilter(source, cb)`, where `cb` is a callback run by `myFilter` when it's finished transforming the source, you can plug this functionality into Fly as follows:

```js
this.filter("myPlugin", (source, options) => {
  return this.defer(myFilter).call(this, source, options)
  //or→ return this.defer(myFilter)(source, options)
})
```

If you need more advanced error handling you can return a promise yourself:

```js
this.filter("myPlugin", function (source, options) {
  return new Promise((resolve, reject) => {
    myFilter(source, function (data, error) {
      // advanced error handling
      else resolve(data)
    })
  })
})
```

Before this landed only sync transformers were supported by plugins.

+ Now plugins can specify the file extension transformed files should have.

```js
this.filter("myFilter", (source, options) => {}, {
  extension: ".html"
})
```

+ Fix a bug in the `npm` scripts that was causing the build to fail due to the tests not being able to find the `dist/` directory. Now `npm run build` only compiles the project.

+ Default tasks named `main` will no longer work as the _default_ task, please rename to `default` or export a default task.

ES5
```js
module.exports = function* () { ... }
```

ES6~
```js
export default function* () { ... }
```

+ We are now back to using `co` at the CLI bootstraper `bin/index.js` and having `src/index.js` simply export a generator.

## v0.1.10

+ Bump interpret version with correct support for Earl Grey.

## v0.1.10

+ Bugfix: Same bug as [v0.1.8](#v018), but this is correctly fixed by adding `babel-core` to dependencies. `babel` is still kept in `devDependencies` as you will need it to compile Fly during development.

+ Fix links in `CHANGELOG.md` versions.

## v0.1.9

+ Improve deploy script to add pushing to the origin as well.

## v0.1.8

+ Bugfix: Fly was not correctly transpiling ES6/ES7 Flyfiles using the `export` keyword in new installations. The cause was the npm build script was missing the  `--modules common` flag.

+ Add deploy script to `package.json` to simplify publishing to the registry. Make sure to bump Fly's version (`npm version *.*.*`) before running `npm run deploy`.

## v0.1.7

+ __Important__: Default tasks named as `main` will be __deprecated__ in `0.2.0`. Please update your code accordingly. (This "feature" was originally introduced in `v0.1.0`)

### Cascading Tasks
> Inpired by Koa.js [cascading middleware](http://koajs.com/#cascading).

+ Now it's possible to return a value from a task and receive it in the task executing right after. This opens the door to other ways for tasks to interact with each other.

This change is possible without breaking the API and easily by making `Fly.prototype.start([tasks])` return a promise. Up until now `start` was used in by the CLI engine in `/index.js` and by `Fly.prototype.watch()` to run tasks without checking on the return value.

This change also fixes a bug that was causing the reporter to incorrectly display the `default` task as _finished_ before time sometimes.

Basically it works as follows:

```js
export function* first () {
  return { secret: 42 }
}

export function* second ({ secret }) {
  this.log(`The secret is ${secret}`)
}

export default function* () {
  yield this.start(["first", "second"])
}
```

See `examples/Flyfile-Start.babel.js`.


+ Code refactoring and comments improvement in `fly.js`, `index.js`, `util.js`
  + The `co`-routine used in the CLI is no longer required in `bin/index.js` and this it is now encapsulated in `index.js`

+ Now `util` just exports `console.log.bind(console)` and `console.error.bind(console)`, this may change in the future if Fly needs to provide a different low level logging mechanism.

+ Updated documentation in English and 日本語.

+ Earl Gray's dependencies were removed. Please `npm i earlgrey earlgrey-runtime` if you are writing Flyfiles in [Earl Gray](https://github.com/breuleux/earl-grey).

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

+ Fly initial commit.

+ Commits between `0.0.1` and `0.0.4` consisted of adding comments, creating the CHANGELOG, adding examples, and other refactorings. Refer to [this issue](https://github.com/flyjs/fly/issues/12) regarding the jump from `0.5.0` to `0.1.0`.
