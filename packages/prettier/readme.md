# @taskr/prettier [![npm](https://img.shields.io/npm/v/@taskr/prettier.svg)](https://npmjs.org/package/@taskr/prettier)

> [Prettier](https://github.com/prettier/prettier) plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/prettier
```

## Usage

```js
exports.lint = function * (task) {
  yield task.source('src/**/*.js').prettier({
    semi: false,
    useTabs: true,
    trailingComma: 'es5'
  }).target('dist/js');
}
```

## API

### .prettier(options)

All configuration options can be found in [Prettier's API documentation](https://github.com/prettier/prettier#api).


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/prettier`.

## License

MIT © [Luke Edwards](https://lukeed.com)
