# @taskr/coffee [![npm](https://img.shields.io/npm/v/@taskr/coffee.svg)](https://npmjs.org/package/@taskr/coffee)

> [CoffeeScript](http://coffeescript.org/) plugin for [Taskr](https://github.com/lukeed/taskr).


## Install

```
$ npm install --save-dev @taskr/coffee
```

## Usage

Check out the [documentation](http://coffeescript.org/#usage) to see the available options.

```js
exports.coffee = function * (task) {
  yield task.source('src/**/*.coffee').coffee({
    sourceMap: true
  }).target('dist/js')
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/coffee`.

## License

MIT © [Luke Edwards](https://lukeed.com)
