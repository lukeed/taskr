# @taskr/less [![npm](https://img.shields.io/npm/v/@taskr/less.svg)](https://npmjs.org/package/@taskr/less)

> Compile LESS to CSS with [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/less
```

## Usage

The paths within `task.source()` should always point to files that you want transformed into `.css` files.

#### Basic

```js
exports.styles = function * (task) {
  yield task.source('src/pages/*.less').less({
    sourceMap: { sourceMapFileInline:true }
  }).target('dist/css');
}
```

#### Multiple Bundles

Simply create an array of individual file paths.

```js
exports.styles = function * (task) {
  yield task.source([
    'src/styles/client.less',
    'src/styles/admin.less'
  ]).less().target('dist');
}
```

## API

### .less(options)

This plugin does not have any custom options. Please visit LESSCSS.org's [Configuration](http://lesscss.org/#using-less-configuration) and [Programmatic Usage](http://lesscss.org/usage/#programmatic-usage) docs for available options.

> **Note:** You will _not_ be able to set the `filename` option. This is done for you & cannot be changed.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/less`.

## License

MIT © [Luke Edwards](https://lukeed.com)
