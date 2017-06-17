# @taskr/sass [![npm](https://img.shields.io/npm/v/@taskr/sass.svg)](https://npmjs.org/package/@taskr/sass)

> Compile SASS with [`node-sass`](https://github.com/sass/node-sass) and [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/sass
```

## Usage

The paths within `task.source()` should always point to files that you want transformed into `.css` files.

#### Basic

```js
exports.styles = function * (task) {
  yield task.source('src/styles/style.scss').sass().target('dist');
}
```

#### Multiple Bundles

Simply create an array of individual file paths.

```js
exports.styles = function * (task) {
  yield task.source([
    'src/styles/client.scss',
    'src/styles/admin.scss'
  ]).sass().target('dist');
}
```

#### SASS vs SCSS

There is no need to set [`indentedSyntax`](https://github.com/sass/node-sass#indentedsyntax) -- the SASS parser will intelligently decipher if you are using the SASS syntax.

```js
exports.styles = function * (task) {
  yield task.source([
    'src/styles/client.sass', // SASS
    'src/styles/admin.scss' // SCSS
  ]).sass().target('dist');
}
```

#### Sourcemaps

You may create source maps for your bundles. Simply provide the desired file path as `outFile` or `sourceMap`.

> **Important:** It is _recommended_ that you provide `sourceMap` your desired path. However, if `sourceMap` is `true`, you **must** then provide `outFile` your file path string.

```js
exports.styles = function * (task) {
  yield task.source('src/app.sass')
    .sass({ sourceMap:'dist/css/app.css.map' })
    .target('dist');
}

// OR

exports.styles = function * (task) {
  yield task.source('src/app.sass')
    .sass({ sourceMap:true, outFile:'dist/css/app.css.map' })
    .target('dist');
}
```

## API

### .sass(options)

This plugin does not have any custom options. Please visit [`node-sass` options](https://github.com/sass/node-sass#options) for a full list of available options.

> **Note:** You will _not_ be able to set the `file` or `data` options. These are done for you & cannot be changed.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/sass`.

## License

MIT © [Luke Edwards](https://lukeed.com)
