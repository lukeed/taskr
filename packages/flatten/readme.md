# @taskr/flatten [![npm](https://img.shields.io/npm/v/@taskr/flatten.svg)](https://npmjs.org/package/@taskr/flatten)

> Flatten all source files to a specified maximum of sub-directories.

A source's directory structure isn't always desirable in the output. With `@taskr/flatten`, you may dictate how many _parent directories_ of a file to keep.

## Install

```a
npm install --save-dev @taskr/flatten
```

## Usage

```sh
src
├── images
│   ├── img.jpg
│   ├── foo
│      ├── foo.jpg
│      ├── bar
│         ├── bar.jpg
```

```js
exports.images = function * (task) {
  yield task.source('src/images/**/*.jpg').flatten({ levels: 1 }).target('dist/img');
}
```

```sh
# output
dist
├── img
│   ├── img.jpg
│   ├── foo
│      ├── foo.jpg
│   ├── bar
│      ├── bar.jpg
```

## API

### .flatten(options)

#### options.levels

Type: `Number`<br>
Default: `0`

The number of sub-directories allowed **in relation to** your glob root.


## Examples

All examples use the [demo file tree](#usage) listed above.

### Level: 0

No parent directories are kept.

> **Note:** The `img` directory is kept because we've used `.target('dist/img')`.

```
dist
├── img
│   ├── img.jpg
│   ├── foo.jpg
│   ├── bar.jpg
```

### Level: 1

Each file is allowed to keep 1 parent directory.

```
dist
├── img
│   ├── img.jpg
│   ├── foo
│      ├── foo.jpg
│   ├── bar
│      ├── bar.jpg
```

### Level: 5

Our file tree is **only** 2 levels deep (`images [0]/foo [1]/bar [2]/bar.jpg`). Because our "allowed levels" exceeds our tree depth, `@taskr/flatten` won't do anthing and so the entire structure will be copied.

```sh
dist
├── img
│   ├── img.jpg
│   ├── foo
│      ├── foo.jpg
│      ├── bar
│         ├── bar.jpg
```


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/flatten`.

## License

MIT © [Luke Edwards](https://lukeed.com)
