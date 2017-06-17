# @taskr/unflow [![npm](https://img.shields.io/npm/v/@taskr/unflow.svg)](https://npmjs.org/package/@taskr/unflow)

> Removes [Flow](https://flow.org/) type annotations with [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/unflow
```

## Usage

```js
exports.build = function * (task) {
  yield task.source('src/**/*.js').unflow({
    all: false,
    sourceMap: 'inline'
  }).target('lib');
};
```

## API

### .unflow(options)

#### options.all

Type: `Boolean`<br>
Default: `true`

Transforms _all_ files; not just those with a "@flow" comment.

#### options.pretty

Type: `Boolean`<br>
Default: `true`

Remove whitespace where annotations used to be. See [here](https://github.com/flowtype/flow-remove-types#pretty-transform) for more info.

#### options.sourceMap

Type: `String`<br>
Options: `internal|external`<br>
Default: `''`

Create an inline or an external sourcemap for each entry file. A `sourceMappingURL` comment is appended to each destination file.

> If using external maps, a `foo.js` entry will also generate a `foo.js.map` file.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/unflow`.

## License

MIT © [Luke Edwards](https://lukeed.com)
