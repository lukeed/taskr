<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=100px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
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
<b><a href="#plugins">Plugins</a></b>
|
<b><a href="#hacking">Hacking</a></b>
|
<b><a href="README.ja.md">日本語</a></b>
|
<b><a href="README.zh-cn.md">简体中文</a></b>

# Documentation
_Fly_ is a task automation tool, very much in the same vein of [Gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589).

_Fly_ is written from the ground up to take advantage of generators and promises.

Similar to Gulp, _Fly_ favors _code_ over configuration.

## Features

> Fly requires [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) support, i.e, `iojs` / `node >= 0.11`.

* Fly shuns the [stream](https://nodejs.org/api/stream.html)-based implementation common in other build systems and favors promises and generator based flow-control via [co-routines](https://github.com/tj/co).

* Fly is itself written in pure EcmaScript5, which makes it very lightweight and quick. You won't have to install a thousand sub-dependencies and tasks will complete faster than their Gulp or Grunt equivalents.

+ By default, Tasks are described using [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) functions and so the asynchronous flow is controlled with [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield):

  ```js
  module.exports.default = function * () {
    yield this.source("index.js").uglify().target("dist")
  }
  ```

+ Fly allows tasks to cascade results. A task's return value is the argument of the next task in a running sequence.

  ```js
  var x = module.exports

  x.default = function * () {
    yield this.start(["first", "second"])
  }

  x.first = function * () {
    return { secret: 42 }
  }

  x.second = function * ({ secret }) {
    this.log(`The secret is ${secret}`)
  }
  ```

+ Fly API allows you to compose tasks similar to a pipeline, but it's not limited to the stream metaphor.

  ```js
  module.exports.default = function * () {
    yield this
      .source("src/**/*.js")
      .eslint()
      .uglify()
      .concat("all.min.js")
      .target("dist")
  }
  ```

+ Fly supports concurrent tasks via `Fly.prototype.start([tasks], { parallel: true })`:

  ```js
  module.exports.default = function * () {
    yield this.start(["task1", "task2", "task3"], { parallel: true })
  }
  ```

+ Use `Fly.prototype.filter(Function)` to add a transform in the sequence. If your function is async wrap it with `Fly.prototype.defer`.

+ Plugins are automatically loaded -- just include it in your `package.json` and under `node_modules`.

+ Use JSDoc's `/** @desc description */` to describe tasks. The text is displayed when listing tasks on the terminal with `fly -l`.

  ```js
  module.exports.task = function * () {
    /** @desc This is the task description. */
  }
  ```

## _Flyfiles_

Similar to other build systems, _Fly_ reads a `flyfile.js` (case sensitive) to run your tasks.

By default, Fly only supports flyfiles written with [ES5](#es5-example) syntax. However, if you prefer [ES6](#es6-example) or [ES7](#es7-example), all you need to do is install [fly-esnext](https://github.com/lukeed/fly-esnext)!

### ES5 Example

A Flyfile exports its tasks as generator functions:

```js
module.exports.default = function * () {
  yield this.source("*")...target("./")
}

// or
exports.default = function * () {
  yield this.source("*")...target("./")
}

// or
var x = module.exports;
x.default = function * () {
  yield this.source("*")...target("./")
}
```

It is recommended to declare a `paths` object to easily maintain and configure your application tasks' relevant directories.

```js
var x = module.exports
var paths = {
  css: {
    src: 'src/styles/*.css',
    dist: 'dist/css'
  },
  js: {
    src: 'src/scripts/*.js',
    dist: 'dist/js'
  }
}

x.default = function * () {
  yield this.start('styles', 'scripts')
}

x.styles = function * () {
  yield this.source(paths.css.src)
    // ...
    .concat('main.css')
    .target(paths.css.dist)
}

x.scripts = function * () {
  yield this.source(paths.js.src)
    .eslint()
    // ...
    .concat('main.js')
    .target(paths.js.dist)
}
```

> This also means that you can separate your pathing configuration from your task definitions. Then you can `require()` your `paths` object into your flyfile.

### ES6 Example

```js
const paths = {
  scripts: ["src/*.js", "!src/ignore.js"]
}

export default function * () {
  yield this.start("lint")
  yield this.source(paths.scripts)...target("dist")
}

export function * lint() {
  // yield this...
}
```

### ES7 Example

```js
const paths = {
  scripts: ["src/*.js", "!src/ignore.js"]
}

export default async function () {
  await this.start("lint")
  await this.source("*")...target("./")
}

export async function lint() {
  // await this...
}
```

Browse the `examples/` folder for additional Flyfile samples.

## CLI

You can access the CLI via `fly [options] [tasks]` in your terminal after installing Fly:

```
fly task1 task2 ...
```

Fly supports the following flags:

#### `-h  --help`

Display the help.

#### `-f  --file` `<path>`

Use an alternate Flyfile.

```
fly -f examples/
```

Or

```
fly -f path/to/another/Flyfile.js
```

#### `-l  --list[=bare]`

Display available tasks.

#### `-v  --version`

Display the version number.

## API

### IO

#### `Fly.prototype.source (...globs, options)`

Begin a _yieldable_ sequence.

```js
module.exports.default = function * () {
  yield this.source("styles/*.scss", "styles/*.sass")
  // ...
}
```

#### Options
  The options are passed to [`node-glob`](https://github.com/isaacs/node-glob#options)

```js
module.exports.default = function * () {
  yield this.source("styles/*.scss", "styles/*.sass", { ignore: 'styles/vendors/**/*' })...
}
```

#### `Fly.prototype.target (targets[, {config}])`

Resolve a _yieldable_ sequence. Reduce the data source applying filters and write the result to `targets`.

**targets**

> Type: `string` or `array`

> Default: `null`

The destination folder(s) to write to.

**config** -- Optional

> Type: `object`

> Default: `{}`

The optional config for destination folder(s).

**config.depth**

> Type: `integer`

> Default: `-1`

The number of parent directories of the source to retain in the target(s). See [Depths](#depths).

```js
exports.default = function * () {
  yield this
    .source("*")
    // ...
    .filter(function (data) {
      return data.toString()
    })
    // ...
    .target(["dist", "build", "test"])
}
```

#### `Fly.prototype.concat (name)`

Concatenate files read with `Fly.prototype.source`.

#### `Fly.prototype.clear (...paths)`

Clears / Deletes all paths including sub directories.

```js
module.exports.default = function * () {
  yield this.clear("dist/main.js", "dist/plugins/**/*.js");
  // ...
}
```

### Depths

A source's directory structure isn't always desirable in the output; however, it is preserved by default if no `config` parameter is found.

But, by specifying a `depth` value, you are dictating how many _parent directories_ of a file to keep.

When handling fonts and images, it's often desired to modify, or _flatten_, the `target` directory's structure. Let's look at the following example structure for a project's images:

```
app
|- images/
  |- img.jpg
  |- one/
    |- one.jpg
    |- two/
      |- two.jpg
```

#### Depth: Default

```js
yield this.source('app/images/**/*.jpg').target('dest/img')
```
The direct descendents of `dest/img` are:
* `img.jpg`
* `one/`

#### Depth: 0
```js
yield this.source('app/images/**/*.jpg').target('dest/img', {depth: 0})
```
The direct descendents of `dest/img` are:
* `img.jpg`
* `one.jpg`
* `two.jpg`

#### Depth: 1
```js
yield this.source('app/images/**/*.jpg').target('dest/img', {depth: 1})
```
The direct descendents of `dest/img` are:
* `img.jpg`
* `one/`
* `two/`

#### Depth: 2
```js
yield this.source('app/images/**/*.jpg').target('dest/img', {depth: 2})
```
The direct descendents of `dest/img` are:
* `img.jpg`
* `one/`

---

**Note:** In this example, anything greater than `depth: 2` returns the original structure because it is/exceeds the original nesting depth.

---


### Filters

#### `Fly.prototype.filter (filter)`

Add a sync/async transform into the `source → target` sequence. Use `Fly.prototype.defer (Function)` to promisify async functions.

> Conceptually similar to a stream, a filter receives the incoming data source and usually returns a new _modified_ version.

> Filters/Plugins are responsible to convert the incoming raw data to a `String` if they are processing text.

```js
module.exports.default = function * () {
  yield this
    .source("*.txt")
    .filter(function (data) {
      return data.replace(/(\w+)\s(\w+)/g, "$2 $1")
     })
    .target("swap")
}
```

The above reads all text files in the current directory and swaps two-letter words.

#### Named Filters

You can specify a name for the filter with `Fly.prototype.filter (name, filter)` and this will inject the method `name` in current Fly instance.

> This feature is mostly used by filter plugins.

> A RangeError will be thrown if a plugin with the same name already exists.

### Tasks

#### `Fly.prototype.start (tasks[, options])`

Run the specified tasks (or the `default` one if `tasks.length === 0`).

  + Can be yielded inside other tasks.

  ```js
  module.exports.default = function * () {
    yield this.start(["lint", "test", "build"])
  }
  ```

#### Options

  + Use the `value` option to pass a value into the first task. Return values cascade on to subsequent tasks.

  ```js
  module.exports.default = function * () {
    this.log(`In ${yield this.start(['z'])} We Trust`) // In Chino We Trust.
  }

  module.exports.z = function * () {
    yield this.start(["a", "b"], {value: 'Coffee'})
    return 'Chino'
  }

  module.exports.a = function * (value) {
    this.log(`Start with ${value}`) // Start with Coffee
    return 'Kafuu'
  }

  module.exports.b = function * (value) {
    this.log(`Continue with ${value}`) // Continue with Kafuu
  }
  ```

  + To run tasks in parallel use `parallel: true`. The following causes `html`, `css` and `js` tasks to start at the same time.

  ```js
  module.exports.default = function * () {
    yield this.start(["html", "css", "js"], {parallel: true})
  }
  ```

#### `Fly.prototype.watch (globs, tasks[, options])`

Run the specified tasks when a change is detected in any of the paths expanded from globs. Returns a promise.

> **Note:** `tasks`, and `options` will be passed to `Fly.prototype.start`

```js
module.exports.watch = function * () {
   yield this.watch("app/lib/**/*.scss", "styles");
  yield this.watch("app/lib/**/*.js", ["js", "lint"], {parallel: true});
}
```


### Other
#### `Fly.prototype.unwrap (onFulfilled, onRejected)`

Unwrap the source globs and returns a promise.

This method can be used when creating plugins that need to expand the source globs in advance, for example, linting / test kind of plugins.


```js
module.exports = function () {
  this.myLint = function (options) {
    var lint = createLinter(options)
    return this.unwrap(function (files) {
    	files.forEach(function (f) {
    		lint(f)
    	})
    })
  }
}
```

### Instrumentation

#### `Fly.prototype.log (...args)`
Log a message with a time stamp.

#### `Fly.prototype.error (...args)`
Log an error message with a time stamp.

#### `Fly.prototype.alert (...args)`
Log a message with a time stamp, if `process.env.VERBOSE` is truthy.

#### `Fly.prototype.debug (...args)`

Log a debug message. Set `DEBUG="*"` or `DEBUG="fly*"` to filter the content. See [`debug`](https://github.com/visionmedia/debug)'s documentation for advance use.



## Plugins

> Please use our [generator](https://github.com/flyjs/generator-fly) to scaffold new plugins.

> Search the registry for new plugins by ["fly" keyword](https://www.npmjs.com/browse/keyword/fly).

> Fly plugins only support ES5 syntax by default. To use or write ES6/ES7 plugins, install (fly-esnext)[https://github.com/lukeed/fly-esnext].

Plugins are node modules that export at least one default method. This method runs when a new Fly instance is created and is bound to the current Fly instance.

```js
module.exports = function () {
  this.myPlugin = function (data) {/* process raw data */}
}
```

Use `Fly.prototype.filter` to avoid name collisions with other existing filters.

> Filters/Plugins are responsible to convert the incoming raw data to a `String` if they are processing text.

```js
module.exports = function () {
  return this.filter("myFilter", function (data, options) {
    return {code /* or `css` or `data` */, ext, map}
  })
}
```

If the method should be _yielded_ inside a task, you must return a promise instead.

```js
module.exports = function () {
  this.myPlugin = function (options) {
    return new Promise(function (resolve, reject) {/* ... */})
  }
}
```

If a plugin does not fall in any of the categories described above, it should return `this` to allow chain composition.

```js
module.exports = function () {
  var self = this
  this.notify = function (options) {
    // ...
    return self
  }
}
```

### Async Functions

Wrap async functions with `Fly.prototype.defer`. This creates a new function that returns a promise. Call this function with `source` and `options`.

```js
this.filter("myPlugin", (data, options) {
  var self = this
  return self.defer(myFilter)(data, options)
})
```

### ES6/ES7 Plugins

If a plugin is throwing a syntax error, chances are that it's using ES6 or ES7 syntax. To fix this, you must install [fly-esnext](https://github.com/lukeed/fly-esnext).

_ES6/ES7 Examples_:

```js
export default function () {
  this.filter("myPlugin", (data, options) => {
    return this.defer(myFilter)(data, options)
  })
}

export default function () {
  this.myPlugin = (options) => new Promise((resolve, reject) => {
    // ...
  })
}

export default function () {
  this.notify = (options) => {
    return this
  }
}
```

## Hacking

```
git clone https://github.com/flyjs/fly
npm install && npm test && npm link
fly -v
```

The above clones the repository, installs dependencies, runs tests and symlinks current fly to your `npm-global`, effectively allowing you to run `fly` from any directory.

> To undo this run `npm unlink fly`.

Install the examples via _Fly_:

```
fly -f examples
```

Run any of the examples:

```
fly -f examples/babel
```

To get started writing Flyfiles, check out our [quickstart guide][quickstart].

:metal:



[quickstart]: https://github.com/flyjs/fly/wiki/Quickstart

