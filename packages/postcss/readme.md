# @taskr/postcss [![npm](https://img.shields.io/npm/v/@taskr/postcss.svg)](https://npmjs.org/package/@taskr/postcss)

> [PostCSS](https://github.com/postcss/postcss) plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/postcss
```

## Usage

The paths within `task.source()` should always point to files that you want transformed into `.css` files.

```js
exports.test = function * (task) {
  yield task.source('src/**/*.scss').postcss({
    plugins: [
      require('precss'),
      require('autoprefixer')
    ],
    options: {
      parser: require('postcss-scss')
    }
  }).target('dist');
}
```

## API

### .postcss(options)

Check out PostCSS's [Options](https://github.com/postcss/postcss#options) documentation to see the available options.

> **Note:** There should be no need to set `options.to` and `options.from`.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/postcss`.

## License

MIT © [Luke Edwards](https://lukeed.com)
