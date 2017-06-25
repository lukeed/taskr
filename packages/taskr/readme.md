# taskr [![npm](https://img.shields.io/npm/v/taskr.svg)](https://npmjs.org/package/taskr)

Taskr is a highly performant task automation tool, much like Gulp or Grunt, but written with concurrency in mind. With Taskr, everything is a [coroutine](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127#.vpryf5tyb), which allows for cascading and composable tasks; but unlike Gulp, it's not limited to the stream metaphor.

Taskr is extremely extensible, so _anything_ can be a task. Our core system will accept whatever you throw at it, resulting in a modular system of reusable plugins and tasks, connected by a declarative `taskfile.js` that's easy to read.

<h2>Table of Contents</h2>

<details>
<summary>Table of Contents</summary>

- [Features](#features)
- [Example](#example)
- [Concepts](#concepts)
    * [Core](#core)
    * [Plugins](#plugins)
    * [Tasks](#tasks)
    * [Taskfiles](#taskfiles)
- [CLI](#cli)
- [API](#api)
    * [Taskr](#taskr-1)
    * [Plugin](#plugin)
    * [Task](#task-1)
    * [Utilities](#utilities)
- [Installation](#installation)
- [Usage](#usage)
    * [Getting Started](#getting-started)
    * [Programmatic](#programmatic)
- [Credits](#credits)
</details>

## Features

- **lightweight:** with `6` dependencies, [installation](#installation) takes seconds
- **minimal API:** Taskr only exposes a couple methods, but they're everything you'll ever need
- **performant:** because of [Bluebird](https://github.com/petkaantonov/bluebird/), creating and running Tasks are quick and inexpensive
- **cascading:** sequential Task chains can cascade their return values, becoming the next Task's argument
- **asynchronous:** concurrent Task chains run without side effects & can be `yield`ed consistently
- **composable:** chain APIs and Tasks directly; say goodbye to `pipe()` x 100!
- **modular:** easily share or export individual Tasks or Plugins for later use
- **stable:** requires Node `>= 4.6` to run (LTS is `6.11`)

## Example

Here's a simple [`taskfile`](#taskfiles) (with [shorthand generator methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions#Shorthand_generator_methods)) depicting a [parallel](#taskrparalleltasks-options) chain.

```js
const sass = 'src/{admin,client}/*.sass';
const js = 'src/{admin,client}/*.js';
const dist = 'build';

module.exports = {
  *lint(task) {
    yield task.source(js).xo({ esnext:true });
  },
  *scripts(task) {
    yield task.source(js).babel({ presets:['es2015'] }).target(`${dist}/js`);
  },
  *styles(task) {
    yield task.source(sass).sass({ outputStyle:'compressed' }).autoprefixer().target(`${dist}/css`);
  },
  *build(task) {
    yield task.parallel(['lint', 'scripts', 'styles']);
  }
}
```

## Concepts

### Core

Taskr is a task runner. It's designed to get you from `A` to `B` -- that's it.

If it helps, imagine you're dining in a restaurant and Taskr is the food runner. Taskr's role is solely to collect meals from the kitchen (`task.source`) and deliver them to the correct table (`task.target`). As a food runner, Taskr may do this one plate at a time (`task.serial`) or deliver multiple plates at once (`task.parallel`). Either way, Taskr only cares about going from `A` to `B`. It may not be the most glamorous job, but as far as you (the patron) are concerned, it's incredibly important because it brings you food.

### Plugins

Because Taskr is single-minded and cares only about executing [tasks](#tasks), **everything else is a plugin**. This keeps development with Taskr easy, approachable, and lightweight.

You see, installing Taskr gives access to a reliable task runner. You decide what it _can do_, provide it functionality, and dictate when to do it. You're in full control.

Through plugins, you are able to capture useful behavior and share them across tasks or projects for repeated use. Plugins come in three flavors:

* **external** - installed via NPM; called "external" because they live outside your codebase
* **inline** - generally simple, one-time functions; not sensible for reuse since declared within a task (hence "inline")
* **local** - private, reusable plugins; appear exactly like external plugins but not public on NPM.

### Tasks

Tasks are used to tell Taskr what to do. They are written as generator functions & converted to coroutines internally. They're also fully self-contained and, like plugins, can be shared across projects if desired.

Upon runtime, tasks are cheap to create, so are also destroyed once completed. This also helps Taskr remain efficient; history won't weigh it down.

Lastly, tasks have the power to [start](#taskstarttask-options) other Tasks, including [serial](#taskserialtasks-options) and [parallel](#taskparalleltasks-options) chains!

### Taskfiles

Much like Gulp, Taskr uses a `taskfile.js` (case sensitive) to read and run your Tasks. However, because it's a regular JavaScript file, you may also `require()` additional modules and incorporate them directly into your Tasks, without the need for a custom Plugin!

```js
const browserSync = require('browser-sync');

exports.serve = function * (task) {
  browserSync({
    port: 3000,
    server: 'dist',
    middleware: [
      require('connect-history-api-fallback')()
    ]
  });
  yield task.$.log('> Listening on localhost:3000');
}
```

Taskfiles should generally be placed in the root of your project, alongside your `package.json`. Although this is not required, Taskr (strongly) prefers this location.

> **Note:** You may set an alternate directory path through the CLI's `cwd` option.

Through Node, Taskr only supports ES5 syntax; however, if you prefer ES6 or ES7, just install [`@taskr/esnext`](https://github.com/lukeed/taskr/tree/master/packages/esnext)!

## CLI

Taskr's CLI tool is very simple and straightforward.

```
taskr [options] <task names>
taskr --mode=parallel task1 task2 ...
```
> Please run `taskr --help` or `taskr -h` for usage information.

Most commonly, the CLI is used for [NPM script](https://docs.npmjs.com/misc/scripts) definitions.

```js
// package.json
{
  "scripts": {
    "build": "taskr foo bar"
  }
}
```

## API

### Taskr

Taskr itself acts as a "parent" class to its `Task` children. Because of this, Taskr's methods are purely executive; aka, they manage Tasks and tell them how & when to run.

#### Taskr.start(task, [options])
Yield: `Any`<br>
Start a Task by its name; may also pass initial values. Can return anything the Task is designed to.

##### task
Type: `String`<br>
Default: `'default'`<br>
The Task's name to run. Task must exist/be defined or an Error is thrown.<br>
> **Important!** Taskr expects a `default` task if no task is specified. This also applies to CLI usage.

##### options
Type: `Object`<br>
Default: `{ src:null, val:null }`<br>
Initial/Custom values to start with. You may customize the object shape, but only `val` will be cascaded from Task to Task.

#### Taskr.parallel(tasks, [options])
Yield: `Any`<br>
Run a group of tasks simultaneously. Cascading is disabled.
##### tasks
Type: `Array`<br>
The names of Tasks to run. Task names must be `string`s and must be defined.
##### options
Type: `Object`<br>
Initial values to start with; passed to each task in the group. Does not cascade.

#### Taskr.serial(tasks, [options])
Yield: `Any`<br>
Run a group of tasks sequentially. Cascading is enabled.
##### tasks
Type: `Array`<br>
The names of Tasks to run. Task names must be `string`s and must be defined.
##### options
Type: `Object`<br>
Initial values to start with; passed to each task in the group. Does cascade.

```js
module.exports = {
  *default(task) {
    yield task.serial(['first', 'second'], { val:10 });
  },
  *first(task, opts) {
    yield task.$.log(`first: ${opts.val}`);
    return opts.val * 4;
  },
  *second(task, opts) {
    yield task.$.log(`second: ${opts.val}`);
    return opts.val + 2;
  }
}

const output = yield task.start();
//=> first: 10
//=> second: 40
console.log(output);
//=> 42
```

### Plugin

Plugins can be external, internal, or local. However, all plugins share the same options:

##### options.every
Type: `Boolean`<br>
Default: `true`<br>
If the plugin function should iterate through _every_ `file|glob`.

##### options.files
Type: `Boolean`<br>
Default: `true`<br>
If the plugin should receive the Task's `glob` patterns or its expanded `file` objects. Uses `globs` if `false`.

Every plugin must also pass a **generator function**, which will be wrapped into a coroutine. This function's arguments will be the `file|glob`(s), depending on the `options.every` and `options.files` combination. The function's second argument is the user-provided config object.

The plugin's generator function is **always** bound to the current `Task`, which means `this` refers to the Task instance.

#### Internal Plugins

Internal plugins are for single-use only. If you're defining the same behavior repeatedly, it should be extracted to a local or external plugin instead.

> **Note:** Inline plugins have no need for a second argument in their generator function; you are the "user" here.

See [`task.run`](#taskrunoptions-generator) for a simple example. The same inline example may be written purely as an object:

```js
exports.foo = function * (task) {
  yield task.source('src/*.js').run({
    every: false,
    *func(files) {
      Array.isArray(files); //=> true
      yield Promise.resolve('this will run once.');
    }
  }).target('dist');
}
```

#### External Plugins

Unlike "inline" plugins, external and local plugins are defined before a Task is performed. Because of this, they must define a `name` for their method to use within a Task.

Similar to inline plugins, there are two ways of defining an exported module -- via functional or object definitions.

When using a _functional definition_, the **definition** receives the [Taskr](#taskr-1) instance and the [utilities](#utilities) object.

```js
module.exports = function (task, utils) {
  // promisify before running else repeats per execution
  const render = utils.promisify(function () {});
  // verbose API
  task.plugin('myName', {every: false}, function * (files, opts) {
    console.log('all my files: ', files); //=> Array
    console.log(this._.files === files); //=> true
    console.log(this instanceof Task); //=> true
    console.log('user options: ', opts);
    yield render(opts);
  });
  // or w/condensed API
  task.plugin({
    name: 'myName',
    every: false,
    *func(files, opts) {
      // ...same
    }
  });
}
```

When using an _object definition_, you are not provided the `task` or `utils` parameters. **This assumes that you do not need any prep work for your plugin!**

```js
module.exports = {
  name: 'myName',
  every: false,
  *func(files, opts) {
    // do stuff
  }
}
```

Then, within your Task, you may use it like so:

```js
exports.default = function * (task) {
  yield task.source('src/*.js').myName({ foo:'bar' }).target('dist');
}
```

#### Local Plugins

Local plugins are defined exactly like external plugins. The only difference is that they're not installable via NPM.

In order to use a local plugin, add a `taskr` key to your `package.json` file. Then define a `requires` array with paths to your plugins.

```js
{
  "taskr": {
    "requires": [
      "./build/custom-plugin-one.js",
      "./build/custom-plugin-two.js"
    ]
  }
}
```

For [programmatic usage](#programmatic), simply pass an array of definitions to the `plugins` key:

```js
const Taskr = require('taskr')
const taskr = new Taskr({
  plugins: [
    require('./build/custom-plugin-one.js'),
    require('./build/custom-plugin-two.js'),
    require('@taskr/clear')
    {
      name: 'plugThree',
      every: false,
      files: false,
      *func(globs, opts) {
        // nifty, eh?
      }
    }
  ]
});
```

### Task

A Task receives itself as its first argument. We choose to name the parameter `task` simply as a convention; of course, you may call it whatever you'd like.

Tasks are exported from a `taskfile.js`, which means you can use either syntax:

```js
exports.foo = function * (task) {
  yield task.source('src/*.js').target('dist/js');
}
exports.bar = function * (task) {
  yield task.source('src/*.css').target('dist/css');
}
// or
module.exports = {
  *foo(task) {
    yield task.source('src/*.js').target('dist/js');
  },
  *bar(task) {
    yield task.source('src/*.css').target('dist/css');
  }
}
```

Each Task also receives an `opts` object, consisting of `src` and `val` keys. Although `src` is primarily used for [`@taskr/watch`](https://github.com/lukeed/taskr/tree/master/packages/watch), the `val` key can be used or set at any time see [`Taskr.serial`](#taskrserialtasks-options).

All methods and values below are exposed within a Task's function.

#### task.root
Type: `String`<br>
The directory wherein `taskfile.js` resides, now considered the root. Also accessible within plugins.

#### task.$
Type: `Object`<br>
The Task's utility helpers. Also accessible within plugins. See [Utilities](#utilities).

#### task._
Type: `Object`<br>
The Task's internal state, populated by `task.source()`. Also accessible within plugins.
##### task._.files
Type: `Array`<br>
The Task's active files. Each object contains a `dir` and `base` key from its [`pathObject`](https://nodejs.org/api/path.html#path_path_format_pathobject) and maintains the file's Buffer contents as a `data` key.
##### task._.globs
Type: `Array`<br>
The Task's glob patterns, from `task.source()`. Used to populate `task._.files`.
##### task._.prevs
Type: `Array`<br>
The Task's last-known (aka, outdated) set of glob patterns. Used **only** for [`@taskr/watch`](https://github.com/lukeed/taskr/tree/master/packages/watch).

#### task.source(globs, [options])
##### globs
Type: `Array|String`<br>
Any valid glob pattern or array of patterns.
##### options
Type: `Object`<br>
Default: `{}`<br>
Additional options, passed directly to [`node-glob`](https://github.com/isaacs/node-glob#options).

#### task.target(dirs, [options])
##### dirs
Type: `Array|String`<br>
The destination folder(s).
##### options
Type: `Object`<br>
Default: `{}`<br>
Additional options, passed directly to [`fs.writeFile`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).

Please note that `task.source()` glob ambiguity affects the destination structure.

```js
yield task.source('src/*.js').target('dist');
//=> dist/foo.js, dist/bar.js
yield task.source('src/**/*.js').target('dist');
//=> dist/foo.js, dist/bar.js, dist/sub/baz.js, dist/sub/deep/bat.js
```

#### task.run(options, generator)
Perform an inline plugin.

##### options
Type: `Object`<br>
The See [plugin options](#plugin).
##### generator
Type: `Function`<br>
The action to perform; must be a `Generator` function.

```js
exports.foo = function * (task) {
  yield task.source('src/*.js').run({ every:false }, function * (files) {
    Array.isArray(files); //=> true
    yield Promise.resolve('this will run once.');
  }).target('dist')
}
```

#### task.start(task, [options])
See [`Taskr.start`](#taskrstarttask-options).

#### task.parallel(tasks, [options])
See [`Taskr.parallel`](#taskrparalleltasks-options).

#### task.serial(tasks, [options])
See [`Taskr.serial`](#taskrserialtasks-options).

### Utilities

A collection of utility helpers to make life easy.

#### alert(...msg)
Print to console with timestamp and alert coloring. See [`utils.log`](#logmsg).
##### msg
Type: `String`

#### coroutine(generator)
See [Bluebird.coroutine](http://bluebirdjs.com/docs/api/promise.coroutine.html).

#### error(...msg)
Print to console with timestamp and error coloring. See [`utils.log`](#logmsg).
##### msg
Type: `String`

#### expand(globs, options)
Yield: `Array`<br>
Get all filepaths that match the glob pattern constraints.
##### globs
Type: `Array|String`
##### options
Type: `Object`<br>
Default: `{}`<br>
Additional options, passed directly to [`node-glob`](https://github.com/isaacs/node-glob#options).

#### find(filename, dir)
Yield: `String|null`<br>
Find a complete filepath from a given path, or optional directory.
##### filename
Type: `String`<br>
The file to file; may also be a complete filepath.
##### dir
Type: `String`<br>
Default: `'.'`<br>
The directory to look within. Will be prepended to the `filename` value.

#### log(...msg)
Print to console with timestamp and normal coloring.
##### msg
Type: `String`<br>
You may pass more than one `msg` string.

```js
utils.log('Hello');
//=> [10:51:04] Hello
utils.log('Hello', 'World');
//=> [10:51:14] Hello World
```

#### promisify(function, callback)
See [Bluebird.promisify](http://bluebirdjs.com/docs/api/promise.promisify.html).

#### read(filepath, options)
Yield: `Buffer|String|null`<br>
Get a file's contents. Ignores directory paths.
##### filepath
Type: `String`<br>
The full filepath to read.
##### options
Type: `Object`<br>
Additional options, passed to [`fs.readFile`](https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback).

#### trace(stack)
Parse and prettify an Error's stack.

#### write(filepath, data, options)
Yield: `null`<br>
Write given data to a filepath. Will create directories as needed.
##### filepath
Type: `String`<br>
The full filepath to write into.
##### data
Type: `String|Buffer`<br>
The data to be written; see [`fs.writeFile`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).
##### options
Type: `Object`<br>
Additional options, passed to [`fs.writeFile`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).

## Installation

```sh
$ npm install --save-dev taskr
```

## Usage

### Getting Started

1. Install Taskr & any desired plugins. (see [installation](#installation) and [ecosystem](https://github.com/lukeed/taskr#packages))
2. Create a `taskfile.js` next to your `package.json`.
3. Define `default` and additional tasks within your `taskfile.js`.

  ```js
  exports.default = function * (task) {
    yield task.parallel(['styles', 'scripts']);
  }

  exports.styles = function * (task) {
    yield task.source('src/**/*.css').autoprefixer().target('dist/css');
  }

  exports.scripts = function * (task) {
    yield task.source('src/**/*.js').babel({
      presets: [
        ['es2015', { loose:true, modules:false }]
      ]
    }).target('dist/js');
  }
  ```
4. Add a `"scripts"` key to your `package.json`:

  ```json
  {
    "name": "my-project",
    "scripts": {
      "build": "taskr"
    }
  }
  ```

  > **Note:** The `default` task is run if no other tasks are specified.
5. Run your `build` command:

  ```sh
  $ npm run build
  ```

You may be interested in checking out [Web Starter Kit](https://github.com/lukeed/fly-kit-web) for a head start.

### Programmatic

Taskr is extremely flexible should you choose to use Taskr outside of its standard configuration.

The quickest path to a valid `Taskr` instance is to send a `tasks` object:

```js
const Taskr = require('Taskr');
const taskr = new Taskr({
  tasks: {
    *foo(f) {},
    *bar(f) {}
  }
});
taskr.start('foo');
```

By default, your new Taskr instance will not include any plugins. You have the power to pick and choose what your instance needs!

To do this, you may pass an array of [external](#external-plugins) and [local](#local-plugins) `plugins`:

```js
const taskr = new Taskr({
  plugins: [
    require('@taskr/concat'),
    require('@taskr/clear'),
    require('./my-plugin')
  ]
});
```

> **Important:** This assumes you have provided a valid `file` _or_ `tasks` object. Without either of these, your Taskr instance will be incomplete and therefore invalid. This will cause the instance to exit early, which means that your `plugins` will not be mounted to the instance.

You may also define your `tasks` by supplying a `taskfile.js` path to `file`. Whenever you do this, you **should** also update the `cwd` key because your [root](#taskroot) has changed!

```js
const join = require('path').join;

const cwd = join(__dirname, '..', 'build');
const file = join(cwd, 'taskfile.js');

const taskr = new Taskr({ file, cwd });
```


## Credits

This project used to be called `fly`, but [Jorge Bucaran](https://github.com/jbucaran), its original author, generously handed over the project to [Luke Edwards](https://github.com/lukeed) in order to further development. The project is now named `taskr` to reflect the transition and its exicitng new future!

A **big thanks** to [Constantin Titarenko](https://github.com/titarenko) for donating the name `taskr` on NPM -- very much appreciated!
