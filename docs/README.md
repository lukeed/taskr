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
<b><a href="README.jp.md">日本語</a></b>


# Documentation
_Fly_ is a task automation tool, very much in the same vein of  [gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589).

_Fly_ is written from the ground up to take advantage of ES6 [new features](https://github.com/lukehoban/es6features).

Similar to gulp, _Fly_ favors code over configuration, but aims to provide a *definitive* simpler way to describe and compose tasks and plugins.


## Features

* Fly shuns the [stream](https://nodejs.org/api/stream.html)-based implementation common in other build systems and favors promises and generator based flow-control via [co-routines](https://github.com/tj/co). The result is a modern and concise API.

* Fly is written in ES6, but tasks can be written in [other](https://github.com/tkellen/js-interpret#extensions) languages as well.

+ Tasks are described using generator functions and operations returning a promise are yielded with [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield):

  ```js
  exports.task = function* () {
    yield this.task.deploy()
  }
  ```
+ Fly allows tasks to cascade results in a series. A task's return value will be the argument of the next task in the running sequence.

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

+ Plugins are automatically required and available via `this.pluginName` inside tasks granted they exist inside your `node_modules` directory and listed in your `package.json` dependencies, devDependencies, etc. Just `npm i fly-*` the plugin you need and it will be available when _Fly_ is run.

+ You can label tasks using JSDoc syntax `/** @desc description */`. This description is displayed when listing tasks on the terminal with `fly -l`.

  ```js
  exports.task = function* () {
    /** @desc Does something. */
  }
  ```

+ Fly requires at least node `>=0.11` to support [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).


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

## API [![][codeclimate-badge]][codeclimate]

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

#### `Fly.prototype.concat (name)`
Concatenate files read with `Fly.prototype.source`.

#### `Fly.prototype.filter (name, filter)`
Add a sync filter / transform to the promise-pipeline. For async filters, you must wrap the function into a promise using `Fly.prototype.defer` or promisify it yourself.

You can pass a Function as the first argument, and Fly will correctly add it to the filters collection.

#### `Fly.prototype.watch ([globs], [tasks])`

Run the specified tasks when a change is detected in any of the paths expanded from `globs`.

#### `Fly.prototype.start ([tasks])`

Run all tasks specified in `tasks` or the `default` / `main` if `tasks.length === 0`. This method returns a promise which can be yielded inside any task. The return value of each task (after the first) is passed on to the next task in the series.

### `Fly.prototype.source (...globs)`

Adds one or more read operations to the promise-pipeline.

Each file is mapped to a read file promise that resolves in a recursive
filter where each filter / transform is applied yielding a `{ file, data }` object.

`globs` can be both comma separated or a single array of globs.

#### `Fly.prototype.unwrap (promises)`

Resolves an array of promises an returns a new promise with the result.

This method can be used when creating plugins that need to read the source promises before the pipeline is resolved in `Fly.prototype.target`. Examples of plugins that can use this method are lint and test plugins.

#### `Fly.prototype.target (...dest)`

Resolves all source promises and writes to each of the destination paths.

`dest` can be both comma separated or a single array of destination paths.

## Plugins

> See the [Wiki](https://github.com/flyjs/fly/wiki) for the list of plugins. Or search the registry for new [packages](https://www.npmjs.com/search?q=fly-).

> See [this gist](https://gist.github.com/bucaran/f018ade8dee8ae189407) for a README template for Fly plugins.

Plugins are regular node modules that export a single default method. This method is automatically run when a new Fly instance is created.

```js
module.exports = function () {
  return this.filter("myPlugin", (src, opts) => {
    try { return ... }
    catch (e) { throw e }
  })
}
```

> Make sure your method returns `this` if the method should be composed within a `source..target` pipeline (in the example above, `Fly.prototype.filter` already returns `this`).

If the method should _yielded_ inside a task, you must return a promise.

```js
module.exports = function () {
  this.method = function (opts) {
    return new Promise((resolve, reject) => {...})
  }
}
```

[codeclimate-badge]: https://codeclimate.com/github/flyjs/fly/badges/gpa.svg
[codeclimate]: https://codeclimate.com/github/flyjs/fly
