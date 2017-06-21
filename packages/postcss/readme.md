# @taskr/postcss [![npm](https://img.shields.io/npm/v/@taskr/postcss.svg)](https://npmjs.org/package/@taskr/postcss)

> [PostCSS](https://github.com/postcss/postcss) plugin for [Taskr](https://github.com/lukeed/taskr).

## Install

```
$ npm install --save-dev @taskr/postcss
```

## API

### .postcss([options])

Check out PostCSS's [Options](https://github.com/postcss/postcss#options) documentation to see the available options.

> **Note:** There should be no need to set `options.to` and `options.from`.

If you would like to [autoload external PostCSS config](#autoloaded-options), you must not define any `options` directly.


## Usage

#### Embedded Options

> Declare your PostCSS options directly within your `taskfile.js`:

```js
exports.styles = function * (task) {
  yield task.source('src/**/*.scss').postcss({
    plugins: [
      require('precss'),
      require('autoprefixer')({
        browsers: ['last 2 versions']
      })
    ],
    options: {
      parser: require('postcss-scss')
    }
  }).target('dist/css');
}
```

#### Autoloaded Options

> Automatically detect & connect to existing PostCSS configurations

If no [`options`](#api) were defined, `@taskr/postcss` will look for existing `.postcssrc`, `postcss.config.js`, and `.postcssrc.js` root-directory files. Similarly, it will honor a `"postcss"` key within your `package.json` file.

* `.postcssrc` -- must be JSON; see [example](/test/fixtures/sub1/.postcssrc)
* `.postcssrc.js` -- can be JSON or `module.exports` a Function or Object; see [example](/test/fixtures/sub4/.postcssrc.js)
* `postcss.config.js` -- can be JSON or `module.exports` a Function or Object; see [example](/test/fixtures/sub3/postcss.config.js)
* `package.json` -- must use `"postcss"` key & must be JSON; see [example](/test/fixtures/sub2/package.json)

> **Important:** If you take this route, you only need _one_ of the files mentioned!

```js
// taskfile.js
exports.styles = function * (task) {
  yield task.source('src/**/*.scss').postcss().target('dist/css');
}
```

```js
// .postcssrc
{
  "plugins": {
    "precss": {},
    "autoprefixer": {
      "browsers": ["last 2 versions"]
    }
  },
  "options": {
    "parser": "postcss-scss"
  }
}
```


## Support

Any issues or questions can be sent to the [Taskr monorepo](https://github.com/lukeed/taskr/issues/new).

Please be sure to specify that you are using `@taskr/postcss`.

## License

MIT © [Luke Edwards](https://lukeed.com)
