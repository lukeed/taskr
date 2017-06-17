# @taskr/uglify [![npm](https://img.shields.io/npm/v/@taskr/uglify.svg)](https://npmjs.org/package/@taskr/uglify)

> [UglifyJS](https://github.com/mishoo/UglifyJS2) plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/uglify
```

## API

### .uglify(options)

> Check out the [UglifyJS documentation](https://github.com/mishoo/UglifyJS2#usage) to see the available options.

## Usage

```js
exports.build = function * (task) {
  yield task.source('src/**/*.uglify')
    .uglify({
      compress: {
        drop_console: true,
        join_vars: true
      }
    })
    .target('dist');
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/uglify`.

## License

MIT © [Luke Edwards](https://lukeed.com)
