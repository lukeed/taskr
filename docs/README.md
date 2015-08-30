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


# Documentation
_Fly_ is a task automation tool, very much in the same vein of [gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589).

_Fly_ is written from the ground up to take advantage of ES6 [new features](https://github.com/lukehoban/es6features) such as generators and promises.

Similar to gulp, _Fly_ favors _code_ over configuration.

## Features

> Fly requires  [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) support, i.e, `iojs` / `node >= 0.11`.

* Fly shuns the [stream](https://nodejs.org/api/stream.html)-based implementation common in other build systems and favors promises and generator based flow-control via [co-routines](https://github.com/tj/co).

* Fly is itself written in ES6, but tasks can be written in [other languages](https://github.com/tkellen/js-interpret#extensions).

+ Tasks are described using ES6 [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) or ES7 [async](http://jakearchibald.com/2014/es7-async-functions/) functions and async flow is controlled with [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield):

  ```js
  export default function* () {
    yield this.source("index.js").uglify().target("dist")
  }
  ```

+ Fly allows tasks to cascade results. A task's return value is the argument of the next task in a running sequence.

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

+ Fly API allows you to compose tasks similar to a pipeline, but it's not limited to the stream metaphor.

  ```js
  export default function* () {
    yield this
      .source("src/**/*.js")
      .babel()
      .uglify()
      .concat("all.min.js")
      .target("dist")
  }
  ```

+ Fly supports concurrent tasks via `Fly.prototype.start([tasks], { parallel: true })`:

  ```js
  export default function* () {
    yield this.start(["task1", "task2", "task3"], { parallel: true })
  }
  ```

+ Use `Fly.prototype.filter(Function)` to add a transform in the sequence. If your function is async wrap it with `Fly.prototype.defer`.

+ Plugins are automatically loaded, just include it in your `package.json` and under `node_modules`.

+ Use JSDoc's `/** @desc description */` to describe tasks. The text is displayed when listing tasks on the terminal with `fly -l`.

  ```js
  export function* task () {
    /** @desc Does something hip. */
  }
  ```

## _Flyfiles_

Similar to other build systems, _Fly_ reads a `flyfile` (case insensitive) to run your tasks.

Flyfiles must include the extension of the language they are written in, `.js` for ES5/6/7, `.coffee` for CoffeeScript, etc.

> ES6/7 is supported out of the box. Other JavaScript variants require the corresponding module to transpile them on the _fly_.

### Examples

A Flyfile exports its tasks as generators / async functions:

_ES5_:
```js
exports.default = function* () {
  yield this.source("*")...target("./")
}
```

_ES6_:
```js
export default function* () {
  yield this.source("*")...target("./")
}
```

_ES7_:
```js
export default async function () {
  await this.source("*")...target("./")
}
```

See inside `examples/` for a large collection Flyfile samples.

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
fly -f path/to/another/Flyfile
```

#### `-l  --list[=bare]`

Display available tasks.

#### `-v  --version`

Display the version number.

## API

### IO

#### `Fly.prototype.source (...globs)`

Begin a _yieldable_ sequence.

```js
export default function* () {
  yield this.source("styles/*.scss", "styles/*.sass")...
}
```

#### `Fly.prototype.target (...targets)`

Resolve a _yieldable_ sequence. Reduce the data source applying filters and write the result to `targets`.

```js
export default function* () {
  yield this
    .source("*")
    ...
    .filter((data) => data.toString())
    ...
    .target("dist", "build", "test")
}
```

#### `Fly.prototype.concat (name)`

Concatenate files read with `Fly.prototype.source`.

#### `Fly.prototype.clear (...paths)`

Clears / Deletes all paths including sub directories.

```js
export default function* () {
  yield this.clear("dist/main.js", "dist/plugins/**/*.js");
  ...
}
```


### Filters

#### `Fly.prototype.filter (filter)`

Add a sync/async transform into the `source → target` sequence. Use `Fly.prototype.defer (Function)` to promisify async functions.

> Conceptually similar to a stream, a filter receives the incoming data source and usually returns a new _modified_ version.

> Filters/Plugins are responsible to convert the incoming raw data to a `String` if they are processing text.

```js
export default function* () {
  yield this
    .source("*.txt")
    .filter((data) => `${data}`.replace(/(\w+)\s(\w+)/g, "$2 $1"))
    .target("swap")
}
```

The above reads all text files in the current directory and swaps two-letter words.

#### Named Filters

You can specify a name for the filter with `Fly.prototype.filter (name, filter)` and this will inject the method `name` in current Fly instance.

> This feature is mostly used by filter plugins.

> A RangeError will be thrown if a plugin with the same name already exists.

### Tasks

#### `Fly.prototype.start ([tasks], options)`

Run the specified tasks (or the `default` one if `tasks.length === 0`).

  + Can be yielded inside other tasks.

  ```js
  export default function* () {
    yield this.start(["lint", "test", "build"])
  }
  ```

#### Options

  + Use the `value` option to pass a value into the first task. Return values cascade on to subsequent tasks.

  ```js
  export default function* () {
    yield this.start(["a", "b", "c"])
    ...
    return 42
  }

  export default function* (secret) {
    this.log(`The secret is ${secret}`) // The secret is 42
  }
  ```

  + To run tasks in parallel use `parallel: true`. The following causes `dev`, `stage` and `server` tasks to start at the same time.

  ```js
  export default function* () {
    yield this.start(["html", "css", "js"], { parallel: true })
  }
  ```

#### `Fly.prototype.watch (globs, tasks)`

Run the specified tasks when a change is detected in any of the paths expanded from `globs`. Returns a promise.


### Other
#### `Fly.prototype.unwrap (onFulfilled, onRejected)`

Unwrap the source globs and returns a promise.

This method can be used when creating plugins that need to expand the source globs in advance, for example, linting / test kind of plugins.


```js
export default function () {
  this.myLint = function (options) {
    const lint = createLinter(options)
    return this.unwrap((files) => files.forEach((f) => lint(f)))
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

Plugins are node modules that export at least one default method. This method runs when a new Fly instance is created and is bound to the current Fly instance.

```js
module.exports = function () {
  this.myPlugin = (data) => /* process raw data */
}
```

Use `Fly.prototype.filter` to avoid name collisions with other existing filters.

> Filters/Plugins are responsible to convert the incoming raw data to a `String` if they are processing text.

```js
module.exports = function () {
  return this.filter("myFilter", (data, options) => {
    return { code /* or `css` or `data` */, ext, map }
  })
}
```

If the method should be _yielded_ inside a task, you must return a promise instead.

```js
module.exports = function () {
  this.myPlugin = function (options) {
    return new Promise((resolve, reject) => {...})
  }
}
```

If a plugin does not fall in any of the categories described above, it should return `this` to allow chain composition.

```js
module.exports = function () {
  this.notify = (options) => {
    ...
    return this
  }
}
```

### Async Functions

Wrap async functions with `Fly.prototype.defer`. This creates a new function that returns a promise. Call this function with `source` and `options`.

```js
this.filter("myPlugin", (data, options) => {
  return this.defer(myFilter)(data, options)
})
```

## Hacking

```
git clone https://github.com/flyjs/fly
npm run setup
fly -v
```

The above clones the repository, installs dependencies, tests and symlinks `bin/index.js` to `usr/local/bin/fly`, effectively allowing you to run `fly` from any directory.

> To undo this run `rm /usr/local/bin/fly`.

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
