# @taskr/stylus [![npm](https://img.shields.io/npm/v/@taskr/stylus.svg)](https://npmjs.org/package/@taskr/stylus)

> Compile [Stylus](http://stylus-lang.com/) to CSS with [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/stylus
```

## Usage

The paths within `task.source()` should always point to files that you want transformed into `.css` files.

```js
exports.styles = function * (task) {
  yield task.source('src/pages/*.styl').stylus({
    sourceMap: { inline:true }
  }).target('dist/css');
}
```

## API

### .stylus(options)

Check out the Stylus [JavaScript API](http://stylus-lang.com/docs/js.html) and [Sourcemaps](http://stylus-lang.com/docs/sourcemaps.html) docs to see the available options.


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/stylus`.

## License

MIT © [Luke Edwards](https://lukeed.com)
