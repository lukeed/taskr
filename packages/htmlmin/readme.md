# @taskr/htmlmin [![npm](https://img.shields.io/npm/v/@taskr/htmlmin.svg)](https://npmjs.org/package/@taskr/htmlmin)

> Minify HTML with [Taskr](https://github.com/lukeed/taskr).

## Install

```
npm install --save-dev @taskr/htmlmin
```

## Usage

```js
exports.minify = function * (task) {
  yield task.source('src/*.html')
    .htmlmin({ removeComments:false })
    .target('dist');
}
```

## API

### .htmlmin(options)

This plugin offers no unique options.

However, it has a number of [default settings](config.js) that you may override.

Please see [HTML-Minifier's Options](https://github.com/kangax/html-minifier#options-quick-reference) for a full list of available options.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/htmlmin`.

## License

MIT © [Luke Edwards](https://lukeed.com)
