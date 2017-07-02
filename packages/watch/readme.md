# @taskr/watch [![npm](https://img.shields.io/npm/v/@taskr/watch.svg)](https://npmjs.org/package/@taskr/watch)

> Watch files & Execute specified tasks on change

After initializing a [Chokidar](https://github.com/paulmillr/chokidar) instance, specified paths will be watched and run Tasks _serially_ in response to adding, updating, or deleting a matching filepath.

When a Task is restarted by `task.watch()`, the Task's `options.src` will contain the full path of the file that triggered a response.


## Install

```
$ npm install --save-dev @taskr/watch
```


## Usage

```js
module.exports = {
  * lint(task, opts) {
    // process single file via `opts.src` if populated
    yield task.source(opts.src || "src/*.js").eslint()
  },
  * scripts(task, opts) {
    // process single file via `opts.src` if populated
    yield task.source(opts.src || "src/*.js").babel({ presets: ["es2015"] }).target("dist/js")
  },
  * styles(task) {
    yield task.source("src/app.sass").sass().target("dist/css")
  },
  * default(task) {
    // watch all JS files; run 'lint' then 'scripts'
    yield task.watch("src/**/*.js", ["lint", "scripts"])
    // watch multiple paths; only run "styles"
    yield task.watch(["src/foo/*.sass", "src/*.sass"], "styles")
  }
}
```


## API

### .watch(globs, tasks, [options])

#### globs

Type: `string` or `array`

A filepath, directory path, or glob pattern. Multiple paths must use an `array`.


#### tasks

Type: `string` or `array`

The task(s) to run when a matched file (from `globs`) is added, changed, or deleted. Multiple tasks must use an `array` and will run as a [serial chain](https://www.npmjs.com/package/taskr#taskrserialtasks-options).

#### options

Type: `object`<br>
Default: `{}`

Initial options to be passed to each Task. See [`Taskr.start`](https://www.npmjs.com/package/taskr#taskrstarttask-options) for more info.


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/watch`.

## License

MIT © [Luke Edwards](https://lukeed.com)
