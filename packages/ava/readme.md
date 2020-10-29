# @taskr/ava [![npm](https://img.shields.io/npm/v/@taskr/ava.svg)](https://npmjs.org/package/@taskr/ava)

> Remove one or multiple directories


## Install

```
$ npm install --save-dev @taskr/ava
```


## Usage

```js
exports.test = function * (task) {
  yield task.source('test/*.js').ava()
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/ava`.

## License

MIT &copy; [Pine Mizune](https://github.com/pine)
