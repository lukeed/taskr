# @taskr/jest [![npm](https://img.shields.io/npm/v/@taskr/jest.svg)](https://npmjs.org/package/@taskr/jest)

> [Jest](https://facebook.github.io/jest/) plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/jest
```

## Usage

```js
exports.test = function * (task) {
  yield task.source('test/**/*.js').jest({ bail:true, notify:true });
}
```

## API

### .jest(options)

See [Jest's Configuration Options](https://facebook.github.io/jest/docs/configuration.html#options) to see the available options.


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/jest`.

## License

MIT © [Luke Edwards](https://lukeed.com)
