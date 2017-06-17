# @taskr/browserify [![npm](https://img.shields.io/npm/v/@taskr/browserify.svg)](https://npmjs.org/package/@taskr/browserify)

> [Browserify](http://browserify.org/) plugin for [Taskr](https://github.com/lukeed/taskr)

## Install

```sh
$ npm install --save-dev @taskr/browserify
```

## API

### .browserify(options)

Please see [Browserify's documentation](https://github.com/substack/node-browserify#browserifyfiles--opts) for a full list of available options.

#### options.entries

Type: `string` or `array`<br>
Default: `''`

Define "entry" files, which represent new bundles. _Optional._ See an [example usage](#direct-paths-via-optsentries).

> **Note:** If not specified, `@taskr/browserify` will assumes **all** files within `task.source()` are new bundle entries.

> **Important:** This plugin (`@taskr/browserify`) enforces **new a bundle per entry** unlike `browserify`.

Using this option is particularly handy when your task (eg, `scripts`) contains plugin methods whose source files should be more than your entry files.

```js
exports.scripts = function * (task) {
  yield task.source('src/scripts/app.js')
    .xo() // ONLY lints one file
    .browserify() // make 'app.js' bundle
    .target('dist/js'); //=> dist/js/app.js

  /* VS */

  yield task.source('src/**/*.js')
    .xo() // lints ALL files
    .browserify({
      entries: 'src/scripts/app.js'
    }) // make 'app.js' bundle
    .target('dist/js'); //=> dist/js/app.js
}
```

## Usage

### Basic

```js
exports.default = function * (task) {
  yield task.source('src/scripts/app.js')
    .browserify()
    .target('dist');
};
```

### Transforms

There's a huge list of [browserify transforms](https://github.com/substack/node-browserify/wiki/list-of-transforms) available to you. You may `require()` any of them & include their functionalities in your bundles.

```js
exports.default = function * (task) {
  yield task.source('src/scripts/app.js')
    .browserify({
      transform: [require('reactify')]
    })
    .target('dist');
};
```

### Multiple Bundles

There are a handful of ways you can create multiple `browserify` "bundles" without the need to repeat your task.

#### Direct Paths via `task.source()`

```js
exports.default = function * (task) {
  yield task.source([
      'src/scripts/app.js',
      'src/scripts/admin.js'
    ])
    .browserify()
    .target('dist');
}
```

#### Glob Patterns via `task.source()`

```js
exports.default = function * (task) {
  yield task.source('src/entries/*.js')
    .browserify()
    .target('dist');
}
```

#### Direct Paths via `opts.entries`

```js
exports.default = function * (task) {
  yield task.source('src/**/*.js')
    .browserify({
      entries: [
       'src/scripts/app.js',
       'src/scripts/admin.js'
      ]
    })
    .target('dist');
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/browserify`.

## License

MIT © [Luke Edwards](https://lukeed.com)
