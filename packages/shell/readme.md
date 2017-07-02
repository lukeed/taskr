# @taskr/shell [![npm](https://img.shields.io/npm/v/@taskr/shell.svg)](https://npmjs.org/package/@taskr/shell)

> Execute shell commands with [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/shell
```

## API

### .shell(command, [options])

Both parameters are optional, but at least one must be present. Additionally, a `command` **is** required

#### command
Type: `string`<br>

The shell command to run. You may also use [`options.cmd`](#optionscmd)

During execution, any occurrences of `$file` or `$glob` will be replaced with the the relevant filepath or glob pattern.

#### options
Type: `object`<br>

`@taskr/shell` uses [execa](https://github.com/sindresorhus/execa) as its `child_process` wrapper. This means it has the same options as [child_process.exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) and shares `execa`'s [additional options](https://github.com/sindresorhus/execa#options).

#### options.cmd
Type: `string`<br>

Same as [`command`](#command). You may want to use this if you only want to specify an `options` object.

#### options.glob
Type: `boolean`<br>

If the command should use the glob pattern within `task.source()`, you must set this to `true`. See [here](#iterate-once-per-glob) for example.


## Usage

#### Iterate Once Per File

You can apply a command to each file of your `glob` match.

Instances of `$file` will be replaced by the file's path.

```js
exports.default = function * (task) {
  yield task.source('src/*.js')
    .shell('cat $file')
    //=> @taskr/shell: console.log('this is src/a.js')
    //=> @taskr/shell: console.log('this is src/b.js')
    //=> @taskr/shell: console.log('this is src/c.js')
    .dist('dist');
}
```

#### Iterate Once Per Glob

You can use the current glob within your shell command.

Instances of `$file` will be replaced by the glob:

```js
exports.default = function * (task) {
  yield task.source('src/*.js')
    .shell('cat $file', { glob:true })
    //=> @taskr/shell:
    //=>     console.log('this is src/a.js')
    //=>     console.log('this is src/b.js')
    //=>     console.log('this is src/c.js')
    .dist('dist');

  yield task.source(['src/*.js', 'src/*.css'])
    .shell({
      cmd: 'cat $glob',
      glob: true
    })
    //=> @taskr/shell:
    //=>     console.log('this is src/a.js')
    //=>     console.log('this is src/b.js')
    //=>     console.log('this is src/c.js')
    //=>     body{margin:0;}header{color:black}
    //=>     .hero{width:100%;height:400px}
    .dist('dist');
}
```

#### Passing Arguments

Of course, command arguments may be passed within your [command string](#command).

```js
exports.default = function * (task) {
  yield task.source('src').shell('ls -alh $file').dist('dist');
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/shell`.

## License

MIT © [Luke Edwards](https://lukeed.com)
