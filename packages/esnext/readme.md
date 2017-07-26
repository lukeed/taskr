# @taskr/esnext [![npm](https://img.shields.io/npm/v/@taskr/esnext.svg)](https://npmjs.org/package/@taskr/esnext)

> Allows a `taskfile.js` to be written with ES6 or ES7 syntax.

## Install

```
$ npm install --save-dev @taskr/esnext
```

**That's it!** :tada: You've now enabled `async`/`await` and `import` syntax for your `taskfile.js`!

> **Note:** This will NOT compile your ES6 files into ES5. You must download and setup [`@taskr/babel`](https://npmjs.com/package/@taskr/babel) or [`@taskr/buble`](https://npmjs.com/package/@taskr/buble) for that.

## Usage

A `taskfile.js` may also include `require()` statements (not shown).

```js
// taskfile.js
import { foo, bar as baz } from './bat';

export default async function (task) {
  await task.source('src/*.js') // etc...
}

export async function lint(task) {
  await task.source('src/*.js') // etc...
}

export async function styles(task, obj) {
  await task.source(obj.src || 'src/*.sass') // etc...
}
```

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/esnext`.

## License

MIT © [Luke Edwards](https://lukeed.com)
