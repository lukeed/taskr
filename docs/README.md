<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=100px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
  </a>
</div>


<p align="center">
<b><a href="#features">Features</a></b>
|
<b><a href="#flyfiles">Flyfiles</a></b>
|
<b><a href="#cli">CLI</a></b>
|
<b><a href="#api">API</a></b>
|
<b><a href="#plugins-1">Plugins</a></b>
|
<b><a href="README.ja.md">日本語</a></b>


# Documentation
_Fly_ is a task automation tool, very much in the same vein of  [gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589).

_Fly_ is written from the ground up to take advantage of ES6 [new features](https://github.com/lukehoban/es6features).

Similar to gulp, _Fly_ favors code over configuration, but aims to provide a *definitive* simpler way to describe and compose tasks and plugins.

## Features


> Fly requires at least node `>=0.11` to support [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

* Fly shuns the [stream](https://nodejs.org/api/stream.html)-based implementation common in other build systems and favors promises and generator based flow-control via [co-routines](https://github.com/tj/co). The result is a modern and concise API.

* Fly is written in ES6, but tasks can be written in [other](https://github.com/tkellen/js-interpret#extensions) languages as well.

+ Tasks are described using generator functions and operations returning a promise are yielded with [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield):

  ```js
  exports.task = function* () {
    yield this.task.deploy()
  }
  ```
+ Fly allows tasks to cascade results in a series. A task's return value will be the argument of the next task in a running sequence.

  ```js
  export default function* () {
    yield this.start(["first", "second"])
  }

  export function* first () {
    return { secret: 42 }
  }

  export function* second ({ secret }) {
    this.log(`The secret is ${secret}`)
  }
  ```

+ Fly lets you compose [_pipeline_](https://www.google.com/search?q=pipeline+code&espv=2&biw=1186&bih=705&source=lnms&tbm=isch&sa=X&ei=L7-SVde6JqPpmQXHyrLIBg&ved=0CAcQ_AUoAg&dpr=2#tbm=isch&q=pipeline+build+system&imgrc=923J2oOnaU_VXM%3A)-like sequences.

  ```js
  exports.scripts = function* () {
    yield this
      .source("src/**/*.coffee")
      .coffee({/* ... */})
      .uglify({/* ... */})
      .concat("all.min.js")
      .target("dist/js")
  }
  ```


+ Fly it's not constrained to the stream metaphor. Examples of tasks that do not fit this paradigm as well as pipe transformations are code analysis, linting, testing, etc.

+ Creating filter / transform plugins is as simple as adding your own filter function into the pipeline via `Fly.prototype.filter`, hence plugins are often 4 or 5 LOC.

+ Async processes can be wrapped into a promise using the  `Fly.prototype.defer` built-in method. You can promisify functions yourself using other libraries as well.

+ A task usually works with a set of globs that expand to multiple files / paths. In Fly was set of expanded globs can be run through the pipeline filter in parallel using the `Fly.prototype.target (dest, { parallel })`

+ Plugins are automatically required and available via `this.pluginName` inside tasks granted they _exist_ inside your `node_modules` directory and listed in your `package.json` dependencies, devDependencies, etc. `npm i fly-*` the plugin you need and it will be available when _Fly_ runs.

+ You can label tasks using JSDoc syntax `/** @desc description */`. This description is displayed when listing tasks on the terminal with `fly -l`.

  ```js
  exports.task = function* () {
    /** @desc Does something hip. */
  }
  ```


## _Flyfiles_

Similar to other build systems, _Fly_ reads a Flyfile to load and run tasks. A _Flypath_ is also a valid file name.

Flyfiles written in ES5, ES6 and ES7 are supported out of the box. Flyfiles written in other JavaScript variants require downloading the corresponding module to transpile them.

> For example `coffee-script` for CoffeeScript.

A Flyfile exports its tasks as generator functions:

_ES5_:
```js
exports.myTask = function* () {
  yield this.source("a").target("b")
}
```

_ES6_:
```js
export function* main () {
  yield this.source("a").target("b")
}
```

See inside `examples/` for Flyfile samples.

## CLI

After you install Fly, you can access the CLI via `fly [options] [tasks]` in your terminal:

```
fly task1 task2 ...
```

Fly currently supports the following flags:

#### `-h  --help`

Display the help.

#### `-f  --file` `<path>`

Use an alternate Flyfile.

```
fly -f examples/
```

Or


```
fly -f path/to/Flyfile
```

#### `-l  --list[=simple]`

Display available tasks. Use `--list=simple` to get a clean print of the tasks.

> Useful to write shell completions.

#### `-v  --version`

Display the version number.

## API
[![][codeclimate-badge]][codeclimate]

Fly exposes a number of methods that let you create and manipulate Fly instances, as well as built-in tasks such as `clear`, `concat` and `filter`.

### `Fly.prototype.constructor`
Creates a new Fly instance.

#### Options

* #### `host`
Loaded _Flyfile_.

* #### `root`
Relative base path / root.

* #### `plugins`
List of plugins to load.

### `Fly.prototype.log (...args)`
Log a message with a time stamp.

### `Fly.prototype.concat (name)`
Concatenate files read with `Fly.prototype.source`.

### `Fly.prototype.filter (name, filter)`
Add a sync/async transform function to the sequence. For async filters, you must wrap the function into a promise using `Fly.prototype.defer` or promisify it yourself.

You can pass a Function as the first argument, and Fly will also add it to the filters collection.

#### `Fly.prototype.watch ([globs], [tasks])`

Run the specified tasks when a change is detected in any of the paths expanded from `globs`.

#### `Fly.prototype.start ([tasks])`

Run all tasks specified in `tasks` or the `default` / `main` if `tasks.length === 0`. This method returns a promise which can be yielded inside any task. The return value of each task (after the first) is passed on to the next task in the series.

### `Fly.prototype.source (...globs)`

Compose a yieldable sequence. Initialize globs, filters and writers.

`globs` can be both comma separated or a single array of globs.

#### `Fly.prototype.unwrap (onFulfilled, onRejected)`

Unwrap the source globs.

This method can be used when creating plugins that need to resolve the source globs and process the data before any IO. Plugins that can benefit from this method are linting and testing plugins.

#### `Fly.prototype.target ([dest], { parallel })`

Yield the expanded glob promises and filter-reduce sources.

`dest` can be both comma separated or a single array of destination paths.

## Plugins

> See the [Wiki](https://github.com/flyjs/fly/wiki) for the list of plugins. Or search the registry for new [packages](https://www.npmjs.com/search?q=fly-).

> Please Use our [generator](https://github.com/flyjs/generator-fly) to scaffold new plugins.

Plugins are regular node modules that export a single default method. This method is automatically run when a new Fly instance is created.

```js
module.exports = function () {
  return this.filter("myPlugin", (src, opts) => {
    try { return ... }
    catch (e) { throw e }
  })
}
```

> Make sure your method returns `this` to allow method calls to be composed in chain.

If the method should be _yielded_ inside a task, you must return a promise.

```js
module.exports = function () {
  this.method = function (opts) {
    return new Promise((resolve, reject) => {...})
  }
}
```

### Async Transformers

Inside the method pass to filter, wrap the async function with `this.defer(myFilter)`. `Fly.prototype.defer` creates a new function that returns a promise. Call this function with `source` and `options`.

```js
this.filter("myPlugin", (source, options) => {
  return this.defer(myFilter)(source, options)
}, { ext: ".fly" })
```

`Fly.prototype.filter` accepts a third argument with options:

+ `ext`: File extension.

[codeclimate-badge]: https://codeclimate.com/github/flyjs/fly/badges/gpa.svg
[codeclimate]: https://codeclimate.com/github/flyjs/fly
