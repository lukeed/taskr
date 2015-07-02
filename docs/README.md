<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=100px  src="https://cloud.githubusercontent.com/assets/8317250/8430194/35c6043a-1f6a-11e5-8cbd-af6cc86baa84.png">
  </a>
</div>


<p align="center">
<b><a href="#synopsis">Synopsis</a></b>
|
<b><a href="#flyfile">Flyfile</a></b>
|
<b><a href="#cli">CLI</a></b>
|
<b><a href="#api">API</a></b>
|
<b><a href="#plugins-1">Plugins</a></b>


# Documentation
_Fly_ is a task automation tool, very much in the same vein of  [Gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589).

Similar to Gulp, _Fly_ favors code over configuration, but aims to provide a definitive simpler way to describe and compose tasks.

## Synopsis

* Fly shuns the [stream](https://nodejs.org/api/stream.html)-based implementation common in other build systems and favors promises and generator based flow-control via [co-routines](https://github.com/tj/co).

* Fly is written in ES6, but it _does not_ require you to write your modules in ES6.

* Fly still lets you compose [_pipeline_](https://www.google.com/search?q=pipeline+code&espv=2&biw=1186&bih=705&source=lnms&tbm=isch&sa=X&ei=L7-SVde6JqPpmQXHyrLIBg&ved=0CAcQ_AUoAg&dpr=2#tbm=isch&q=pipeline+build+system&imgrc=923J2oOnaU_VXM%3A)-like sequences, but it's not constrained to the stream metaphor.

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
> Examples of tasks that do not fit the stream metaphor very well are code analysis, linting, testing, etc.

* Fly requires at least Node `0.11` for [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) support.

+ Creating filter / transform plugins is as simple as adding your own filter function into the pipeline via `Fly.prototype.filter`.

+ Async sub processes can be wrapped into a promise using the  `Fly.prototype.defer` built-in method.

+ Tasks are described using generator functions and operations that return a promise are yielded with [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield):

  ```js
  exports.task = function* () {
    yield this.task.deploy()
  }
  ```

+ Plugins are automatically required and available via `this.pluginName` inside tasks granted they exist inside your `node_modules` directory and listed in your `package.json` dependencies, devDependencies, etc.

+ You can add tasks descriptions using JSDoc syntax `/** @desc description */`.

  ```js
  exports.task = function* () {
    /** @desc Does something. */
  }
  ```

## Flyfile

Similar to other build systems, _Fly_ reads a Flyfile to load and run tasks.

A Flyfile exports its tasks as generator functions:

```js
exports.myTask = function* () {
  yield this.source("a").target("b")
}
```

See inside `examples/` for Flyfile samples.

## CLI

When you install Fly, you can access the CLI via `fly [options] [tasks]` in your terminal:

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

> Useful when writing shell completions.

#### `-v  --version`

Display the version number.

If you have a Flyfile

## API

Fly exposes a number of methods that let you create and manipulate Fly instances, as well as built-in tasks such as `clear`, `concat` and `filter`.

#### `Fly.prototype.constructor`
Creates a new Fly instance.

#### Options

* #### `host`
Loaded _Flyfile_.

* #### `root`
Relative base path / root.

* #### `plugins`
List of plugins to load.

#### `Fly.prototype.log (...args)`
Log a message with a time stamp.

#### `Fly.prototype.reset ()`
Reset the internal state of the Fly instance.

#### `Fly.prototype.clear (...paths)`
[rimraf](https://github.com/isaacs/rimraf) wrapper. Clear each specified directory.

#### `Fly.prototype.concat (name)`
Concatenate files read with `Fly.prototype.source`.

#### `Fly.prototype.filter (...filters)`
Add a sync filter / transform to the promise-pipeline. For async filters, you must wrap the function into a promise using `Fly.prototype.defer` for example.

#### `Fly.prototype.watch (globs, ...tasks)`

Run the specified tasks when a change is detected in any of the paths that expand from `globs`.

#### `Fly.prototype.start (tasks = [])`

Run all tasks specified in `tasks` or the `default` if `tasks.length === 0`.

### `source (...globs)`
Adds one or more read operations to the promise-pipeline.

Each file is mapped to a read file promise that resolves in a recursive
filter where each existing filter is applied and eventually yields a `{ file, data }` object.

#### `Fly.prototype.unwrap (source = this._src)`
Resolves an array of promises an returns a new promise with the result.

This method can be used when creating plugins that need to read the source promises before the pipeline is finally resolved in `Fly.prototype.target`. Examples of plugins that can use this method are linting and testing plugins.

#### `Fly.prototype.target (...dest)`

Resolves all source promises and writes to each of the destination paths.

### External Dependencies

* [co](https://github.com/tj/co)
* [mz/fs](https://github.com/normalize/mz)
* [mkdirp](https://github.com/substack/node-mkdirp)
* [rimraf](https://github.com/isaacs/rimraf)
* [glob](https://github.com/isaacs/node-glob)
* [chokidar](https://github.com/paulmillr/chokidar)

## Plugins

> See the [Wiki](https://github.com/flyjs/fly/wiki) for the list of currently supported plugins.

> See [this gist](https://gist.github.com/bucaran/f018ade8dee8ae189407) for an example README template for your Fly plugins.

Plugins are regular node modules that export a single default method. This method method is automatically run when a new Fly instance is created. The following adds a new method to the Fly instance:

```js
module.exports = function () {
  this.method = function (opts) {
    return this
  }
}
```

Make sure your method returns `this` if the method should be composed within a `source..target` pipeline (typical case of filters / transforms). If the method is supposed to be _yielded_ inside a task, then you must return a promise.

```js
module.exports = function () {
  this.method = function (opts) {
    return new Promise((resolve, reject) => {

    })
  }
}
```
