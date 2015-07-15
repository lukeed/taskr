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
_Fly_ is a task automation tool, very much in the same vein of [gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589).

_Fly_ is written from the ground up to take advantage of ES6 [new features](https://github.com/lukehoban/es6features) such as generators and promises.

Similar to gulp, _Fly_ favors _code_ over configuration, but aims to provide a simpler way to describe tasks and plugins.

## Features

> Fly requires at least node `>=0.11` to support [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) and [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

* Fly shuns the [stream](https://nodejs.org/api/stream.html)-based implementation common in other build systems and favors promises and generator based flow-control via [co-routines](https://github.com/tj/co).

* Fly is itself written in ES6, but tasks can be written in [other languages](https://github.com/tkellen/js-interpret#extensions).

+ Tasks are described using ES6 [generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) or ES7 [async](http://jakearchibald.com/2014/es7-async-functions/) functions and async flow is controlled via [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield):

  ```js
  export function* task () {
    yield this.tasks.write("awesome")
  }
  ```

  ```js
  export async function task () {
    await this.tasks.write("awesome")
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

+ Fly API takes the pipeline metaphor to the next level:

  ```js
  export default function* () {
    yield this
      .source("src/**/*.babel.js")
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

+ Use `Fly.prototype.filter(Function)` to add a transform in the sequence. If your function is async wrap it with `Fly.prototype.defer` and Fly will handle it as expected.

+ Plugins are autoloaded, just make sure to include it in your `package.json` and under `node_modules`.

+ Use JSDoc's `/** @desc description */` to describe tasks. The text is displayed when listing tasks on the terminal with `fly -l`.

  ```js
  export function* task () {
    /** @desc Does something hip. */
  }
  ```

## _Flyfiles_

Similar to other build systems, _Fly_ reads a Flyfile to load and run your tasks. _Flypath_ is also a valid file name.

Flyfiles written in ES5, ES6 and ES7 are supported out of the box. Flyfiles written in other JavaScript variants require downloading the corresponding module to transpile them in the _fly_.

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
  yield this.source("*")...target("./")
}
```

See inside `examples/` for Flyfile samples.

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
fly -f path/to/Flyfile
```

#### `-l  --list[=simple]`

Display available tasks. Use `--list=simple` to get a clean print of the tasks.

> Useful to write shell completions.

#### `-v  --version`

Display the version number.

## API
[![][codeclimate-badge]][codeclimate]

### `Fly.prototype.constructor({ host, root, plugins })`
Creates a new Fly instance.

#### Options

* #### `host`
Loaded _Flyfile_.

* #### `root`
Relative base path / root.

* #### `plugins`
List of plugins to load.


### `Fly.prototype.source (...globs)`

Begin a yieldable sequence. Initialize globs, filters and writers.

```js
export default function* () {
  yield this.source(["styles/*.scss", "styles/.sass"])...
}
```

#### `Fly.prototype.target ([dest])`
> `dest` can be both comma separated or a single array of paths.

Resolve a yieldable sequence. Reduce source applying available filters.

```js
export default function* () {
  yield this
    .source("*")
    ...
    .target("dist", "build", "test")
}
```


#### `Fly.prototype.start ([tasks], { parallel, value })`

Run all tasks specified by `tasks` (or the `default` one if `tasks.length === 0`).

  + Can be yielded inside other tasks.

  ```js
  export default function* () {
    yield this.start(["lint", "test", "build"])
  }
  ```

  + To pass a value into the first task use the `value` option. The return value is passed on to the next task in a series.

  ```js
  export default function* () {
    yield this.start(["a", "b", "c"])
    ...
    return secret
  }
  export default function* (secret) {
    ...
  }
  ```

  + To run tasks in parallel use `parallel: true`.

  ```js
  export default function* () {
    yield this.start(["dev", "staging", "server"], { parallel: true })
  }
  ```

### `Fly.prototype.filter (filter)`
Add a sync/async transform function into the sequence. Use `Fly.prototype.defer (Function)` to promisify async filters.

You can also specify the name of the filter as `Fly.prototype.filter (name, filter)` and a new method will be added to Fly. This feature is used by plugins to inject functionality into the running instance.

```js
export default function* () {
  yield this
    .source("*.txt")
    .filter((s) => s.replace(/(\w+)\s(\w+)/g, "$2 $1"))
    .target("swap")
}
```

#### `Fly.prototype.watch ([globs], [tasks])`

Run the specified tasks when a change is detected in any of the paths expanded from `globs`.


### `Fly.prototype.concat (name)`
> `globs` can be both comma separated or a single array of globs.

Concatenate files read with `Fly.prototype.source`.


#### `Fly.prototype.unwrap (onFulfilled, onRejected)`

Unwrap the source globs.

This method can be used when creating plugins that need to resolve the source globs to bypass / enhance IO operations, etc. Linting and testing plugins are common use cases for this method.


```js
export default function () {
  this.myLint = function (options) {
    const lint = createLinter(options)
    return this.unwrap((files) => files.forEach(file => lint(file)))
  }
}
```

#### `Fly.prototype.write (writer Function)`

Add a writer function to the collection of writers. A _writer_ is the function that runs on each expanded glob and for each specified `destination` target and can result in an IO operation. Examples of method that inject writers into the Fly are `Fly.prototype.target` and `Fly.prototype.concat`.


#### `Fly.prototype.clear (paths)`

Clears / Deletes all paths including sub directories.


### `Fly.prototype.log (...args)`
Log a message with a time stamp.

### `Fly.prototype.error (...args)`
Log an error message with a time stamp.

### `Fly.prototype.debug (...args)`
Log a message with a time stamp only if `process.env.DEVELOPMENT` is truthy.


## Plugins

> Please use our [generator](https://github.com/flyjs/generator-fly) to scaffold new plugins.

> Search the registry for new [plugins](https://www.npmjs.com/search?q=fly-).

Plugins are node modules that export at least one default method. This method is automatically run when a new Fly instance is created.

```js
module.exports = function () {
  return this.filter("myFilter", (source, options) => {
    try {
      return ...newSource
    } catch (e) { throw e }
  })
}
```

If the method should be _yielded_ inside a task, you must return a promise.

```js
module.exports = function () {
  this.myPlugin = function (options) {
    return new Promise((resolve, reject) => {...})
  }
}
```

Plugins not in the categories described above should return `this` to allow chain composition.

```js
module.exports = function () {
  this.notify = function (message) {
    ...
    return this
  }
}
```

### Async Functions

Wrap async functions with `Fly.prototype.defer`. This creates a new function that returns a promise. Call this function with `source` and `options`.

```js
this.filter("myPlugin", (source, options) => {
  return this.defer(myFilter)(source, options)
}, { ext: ".fly" })
```

+ `Fly.prototype.filter` accepts a third argument with options:

  + `ext`: File extension.


[codeclimate-badge]: https://codeclimate.com/github/flyjs/fly/badges/gpa.svg
[codeclimate]: https://codeclimate.com/github/flyjs/fly
