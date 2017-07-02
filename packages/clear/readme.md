# @taskr/clear [![npm](https://img.shields.io/npm/v/@taskr/clear.svg)](https://npmjs.org/package/@taskr/clear)

> Remove one or multiple directories


## Install

```
$ npm install --save-dev @taskr/clear
```


## Usage

```js
exports.cleanup = function * (task) {
  // single file
  yield task.clear('foo.js');

  // single directory
  yield task.clear('dist');

  // multiple directories
  yield task.clear(['dist', 'build']);

  // glob pattern(s)
  yield task.clear(['dist/*.css', 'dist/js/*']);

  // mixed
  yield task.clear(['foo.js', 'build', 'dist/*.css']);

  // with options
  yield task.clear('dist', {maxBusyTries: 5});
}
```


## API

### task.clear(files, [options])

#### files

Type: `string` or `array`

A filepath, directory path, or glob pattern. For multiple paths, use an `array`.


#### options

Type: `object`<br>
Default: `{}`

All options are passed directly to `rimraf`. Please see its [documentation on options](https://github.com/isaacs/rimraf#options).


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/clear`.

## License

MIT © [Luke Edwards](https://lukeed.com)
