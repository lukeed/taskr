# @taskr/babel [![npm](https://img.shields.io/npm/v/@taskr/babel.svg)](https://npmjs.org/package/@taskr/babel)

> Babel plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/babel
```

## API

### .babel(options)

All Babel options can be found [here](http://babeljs.io/docs/usage/options/).

> **Note:** For most cases, you only to think about `presets`, `plugins`, `sourceMaps`, `minified`, `comments`, and/or `babelrc`.

#### options.preload

Type: `boolean`<br>
Default: `false`

Automatically loads all babel-related plugins & presets from `package.json`. Will also auto-configure Babel to use these packages. See the [example](#preloading) for more.

## Usage

#### Basic

```js
exports.scripts = function * (task) {
  yield task.source('src/**/*.js')
    .babel({
      presets: ['es2015']
    })
    .target('dist/js')
}
```

#### Source Maps

You can create source maps for each file.

Passing `true` will create an _external_ `.map` file. You may also use `'inline'` or `'both'`. Please see the [Babel options](http://babeljs.io/docs/usage/options/) for more information.

```js
exports.scripts = function * (task) {
  yield task.source('src/**/*.js')
    .babel({
      presets: ['es2015'],
      sourceMaps: true //=> external; also 'inline' or 'both'
    })
    .target('dist/js')
}
```

#### Preloading

For the especially lazy, you may "preload" all babel-related presets **and** plugins defined within your `package.json`. This spares you the need to define your `presets` and `plugins` values manually.

> **Note:** If you require a [complex configuration](http://babeljs.io/docs/plugins/#pluginpresets-options), you need to define that manually. While other plugins & presets will continue to "preload", your manual definitions will not be lost.

```js
exports.scripts = function * (task) {
  yield task.source('src/**/*.js')
    .babel({
      preload: true,
      plugins: [
        // complex plugin definition:
        ['transform-async-to-module-method', {
          'module': 'bluebird',
          'method': 'coroutine'
        }]
      ]
    })
    .target('dist');
  //=> after preloading:
  //=>   {
  //=>     presets: ['es2015'],
  //=>     plugins: [
  //=>       'transform-class-properties',
  //=>       ['transform-async-to-module-method', {...}]
  //=>     ]
  //=>   }
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/babel`.

## License

MIT © [Luke Edwards](https://lukeed.com)
