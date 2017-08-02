# @taskr/sourcemaps [![npm](https://img.shields.io/npm/v/@taskr/sourcemaps.svg)](https://npmjs.org/package/@taskr/sourcemaps)

> Source maps with [Taskr](https://github.com/lukeed/taskr).

## Install

`@taskr/sourcemaps` is bundled with taskr for built-in source map support. For special cases where you want to initialize or write source maps outside of `task.source` or `task.target`,
you can install `@taskr/sourcemaps` and run as a plugin. For plugins, use `applySourceMap` to add source map support to your plugin.

```
# For standard usage, no need to install, bundled with taskr

# For custom cases
npm install --save-dev @taskr/sourcemaps

# For plugins
npm install --save @taskr/sourcemaps
```

## Usage

Built-in support:

```js
// 1. Initialize / load existing source maps
// 2. Write inline source maps
yield task.source('**/*.js', { sourcemaps: true })
  .babel()
  .target('build');

// 1. Initialize / load existing source maps
// 2. Write external source maps (next to source files)
yield task.source('**/*.scss', { sourcemaps: true })
  .sass()
  .target('build', { sourcemaps: '.' });
```

Custom usage:

```js
yield task.source('**/*.ts')
  .typescript()
  .initSourceMaps({ load: true })
  .babel()
  .writeSourceMaps({ dest: '.' })
  .gzip()
  .target('build');
```

## Plugins

```js
const applySourceMap = require('@taskr/sourcemaps').applySourceMap;
const transform = require('./transform');

module.exports = function(task, options) {
  task.plugin('transform', { every: true }, function * (file) {
    // If sourceMap is enabled for file, make source maps
    if (file.sourceMap) {
      options.makeSourceMap = true;
    }

    const result = transform(file.data, options);
    file.data = result.code;

    // Apply source map, merging with existing
    if (file.sourceMap) {
      applySourceMap(file, result.map);
    }
  });
}
```

## API

### .initSourceMaps(options)

Initialize source maps for files, loading existing if specified

#### options.load

Type: `boolean` <br>
Default: `false`

Load existing source maps for files (inline or external).

### .writeSourceMaps(options)

Write source maps for files, adding them inline or as external files.

#### options

Type: `string|object` <br>
Default: `undefined`

Pass no options to write source maps inline, string for a destination, or an options object.

#### options.dest

Type: `string` <br>
Default: `undefined`

Destination, relative to file, to write external source maps

### applySourceMap(file, sourceMap)

Apply a source map to a taskr file, merging it into any existing sourcemaps

#### file

Type: `object`

Apply source map to this taskr file. If the file has an existing source map, the source map will be merged into it.

#### sourceMap

Type: `string|object`

Source map to apply. For `string`, `JSON.parse` will be used before applying. `file`, `mappings`, and `sources` are required fields for the source map.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/sourcemaps`.

## License

MIT © [Luke Edwards](https://lukeed.com)
