# @taskr/zip [![npm](https://img.shields.io/npm/v/@taskr/zip.svg)](https://npmjs.org/package/@taskr/zip)

> ZIP compress files with [Taskr](https://github.com/lukeed/taskr).


## Install

```
$ npm install --save-dev @taskr/zip
```

## Usage

This example will produce `releases/Archive.zip`, containing all contents within the `dist` directory:

```js
// Option 1
exports.zip = function * (task) {
  yield task.source('dist/**/*').zip({ file:'Archive.zip' }).target('releases');
}
//=> only writes ZIP file to 'releases' dir

// Option 2
exports.zip = function * (task) {
  yield task.source('dist/**/*').zip({
    file: 'Archive.zip',
    dest: '.'
  }).target('releases');
}
//=> writes all files to 'releases'
//=> also writes ZIP file to root dir
```

## API

### .zip(options)

#### options.dest

Type: `string`<br>
Default: `null`

If specified, is an alternate directory wherein the ZIP file should be placed. This should only be used if you'd like to write to a location other than your `task.target()` location.

> **Important:** By providing a `dest` value, the files from `task.source()` will be preserved and remain accessible within the task-chain!

#### options.file

Type: `string`<br>
Default: `'archive.zip'`

The name of your ZIP file. It must include `.zip`.

## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new). Please be sure to specify that you are using `@taskr/zip`.

## License

MIT © [Luke Edwards](https://lukeed.com)
