# @taskr/rev [![npm](https://img.shields.io/npm/v/@taskr/rev.svg)](https://npmjs.org/package/@taskr/rev)

> Prepare front-end assets for cache-busting / versioning / hashing.

This plugin includes three functions:

1. [`rev()`](#revoptions): Rename files by appending a unique hash, based on contents.
2. [`revManifest()`](#revmanifestoptions): Create a manifest that maps old filenames to newly versioned filenames. _(optional)_
3. [`revReplace()`](#revreplaceoptions): Update all references to versioned files. _(optional)_

Make sure to set the files to [never expire](http://developer.yahoo.com/performance/rules.html#expires) for this to have an effect.

## Install
```
$ npm install --save-dev @taskr/rev
```

## Usage

The `rev()` task is the core method; thus is **required** for anything to occur.

Both `revManifest()` and `revReplace()` are optional plugins.

```js
exports.default = function * (task) {
  yield task.source('app/**/*')
    .rev({
      ignores: ['.html', '.jpg', '.png']
     })
    .revManifest({
      dest: 'dist',
      file: 'manifest.json',
      trim: str => str.replace(/app\/client/i, 'assets')
    })
    .revReplace({
      ignores: ['.php']
    })
    .target('dist');
}
```

## API

### .rev(options)

Generate a unique hash (based on a file's contents) and append it to the filename.

```js
bundle.js
//=> bundle-{hash}.js
bundle.min.js
//=> bundle-{hash}.min.js
```

Any files that *are* processed will receive two new keys: `orig` and `hash`. In addition, the `base` key will be updated with the new, versioned filename.

#### options.ignores

Type: `array` <br>
Default: `['.png', '.jpg', '.jpeg', '.svg', '.gif', '.woff', '.ttf', '.eot', '.html', '.json']`

A list of file extensions that should NOT be renamed/processed.

> **Note:** This includes `.html` and `.json` while [`revReplace`](#optionsignores-1) does not.


### revManifest(options)

Create a manifest file that relates old filenames to versioned counterparts.

#### options.file

Type: `string` <br>
Default: `'rev-manifest.json'`

The name of the manifest file to be created.

#### options.dest

Type: `string` <br>
Default: `task.root`

The directory where your manifest file should be created. Defaults to Taskr's root directory (where `taskfile.js` is found).

#### options.sort

Type: `boolean`<br>
Default: `true`

Whether or not the manifest's contents should be sorted alphabetically. (Does not add any performance / usage benefits.)

#### options.trim

Type: `string` or `function`<br>
Default: `.`

Edit the final keys & values within the manifest. If `string`, the value will be resolved relative to Taskr's root directory. Using a `function` provides more fine-tuned control.

```js
yield task.source('app/client/*.js').rev()
  .revManifest({trim: 'app'}).target('dist');
  //=> "client/demo.js": "client/demo-1abd624s.js"

yield task.source('app/client/*.js').rev()
  .revManifest({
    trim: str => str.replace(/app\/client/i, 'assets')
  }).target('dist');
  //=> "assets/demo.js": "assets/demo-1abd624s.js"
```

### revReplace(options)

Update references to all versioned files within a given source.

Matching files from within `task.source()` are available for inspection & modifications. Because of this, **it is recommended** that all your `rev-*` usage is extracted to a separate, production-only task whose `source` includes all development files.

#### options.ignores

Type: `array` <br>
Default: `['.png', '.jpg', '.jpeg', '.svg', '.gif', '.woff', '.ttf', '.eot']`

A list of file extensions whose content should not be updated.

> **Note:** Unlike [`.rev()`](#optionsignores), this list does not include `.html` and `.json`.


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/rev`.

## License

MIT © [Luke Edwards](https://lukeed.com)
