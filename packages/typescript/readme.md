# @taskr/typescript [![npm](https://img.shields.io/npm/v/@taskr/typescript.svg)](https://npmjs.org/package/@taskr/typescript)

> Compile [Typescript](https://github.com/Microsoft/TypeScript) with [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/typescript
```

## Usage

```js
exports.scripts = function * (task) {
  yield task.source('src/**/*.ts').typescript({
    jsx: 'React',
    target: 'ES5',
    sourceMap: true,
    removeComments: true
  }).target('dist/js');
}
```

## API

### .typescript(options)

Unlike most plugins, this plugin provides access to all of Typescript's [Transpile options](https://github.com/Microsoft/TypeScript/blob/master/src/services/transpile.ts#L2-L8). However, _for the sake of simplicity_, this plugin **flattens** all `compilerOptions` keys into the same object. In other words, we **assume** that you're providing `compilerOptions`, unless the given key matches the name of another `TranspileOption`.

> Check out Typescript's [Compile Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to see all Compiler options.

For example:

```js
task.source('...').typescript({
  moduleName: 'FooBar',
  compilerOptions: {
    module: 'System',
    sourceMap: true
  }
}).target('...');

// can be written as:

task.source('...').typescript({
  moduleName: 'FooBar',
  module: 'System',
  sourceMap: true
}).target('...');
```

Notice that `compilerOptions` is no longer defined, and instead, its children (`module`, `sourceMap`, etc) are defined _alongside_ `moduleName`!

> **Note:** The first example (aka, using `compilerOptions`) will still work.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/typescript`.

## License

MIT © [Luke Edwards](https://lukeed.com)
