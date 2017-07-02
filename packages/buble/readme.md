# @taskr/buble [![npm](https://img.shields.io/npm/v/@taskr/buble.svg)](https://npmjs.org/package/@taskr/buble)

> [Bublé](https://buble.surge.sh/guide/) plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/buble
```

## Usage

```js
exports.scripts = function * (task) {
  yield task.source('test/**/*.js').buble({
    inline: true,
    transforms: {
      arrow: true,
      modules: false,
      dangerousForOf: true
    }
  }).target('dist/js');
}
```

## API

### .buble(options)

To view all Bublé options, visit its [documentation](https://buble.surge.sh/guide/#using-the-javascript-api).

This plugin includes two additional options:

#### options.inline
Type: `Boolean`<br>
Default: `false`<br>
If `true`, will append an internal sourcemap (data URI) to the file's contents **instead of** an external link (default). Also will not create a new `*.js.map` file. Requires that `options.sourceMap` to remain `true`.

#### options.sourceMap
Type: `Boolean`<br>
Default: `true`<br>
Creates an external sourcemap by default. Disable _all_ mapping behavior by setting this to `false`.


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/buble`.

## License

MIT © [Luke Edwards](https://lukeed.com)
