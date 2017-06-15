# @taskr/gzip [![npm](https://img.shields.io/npm/v/@taskr/gzip.svg)](https://npmjs.org/package/@taskr/gzip)

> Gzip plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/gzip
```

## Usage

```js
exports.gzip = function * (task) {
	yield task.source('dist/**/*.*')
		.gzip({
      threshold: 1024,
			ext: 'gzip',
			options: {
				level: 9
			}
		})
		.target('dist');
}
```

## API

### .gip(opts)

Any files passed through `.gzip()` will not be affected directly. Instead, a _cloned_ copy will be compressed & have its extension modified. This means your `target` directory will contain the orginal file **and** its gzipped copy.

```
\src
  |- bundle.js
\dist
  |- bundle.js
  |- bundle.js.gz
```

#### opts.ext

Type: `string`<br>
Default: `gz`

The extension to append to the compressed file's type.

```
bundle.js --> bundle.js.gz
```

#### opts.threshold

Type: `integer`<br>
Default: `false`

The minimum size, in bytes, required to be compressed. If a file does not satisfy this requirement, it will not be gzipped.

#### opts.options

Type: `object`<br>
Default: `{}`

The [`zlib` options](https://nodejs.org/api/zlib.html#zlib_class_options) to pass in.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/gzip`.

## License

MIT © [Luke Edwards](https://lukeed.com)
