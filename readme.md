<div align="center">
  <img src="/logo.png" alt="Taskr" width="128">
</div>

<h1 align="center">Taskr</h1>

<div align="center">
  <a href="https://npmjs.org/package/taskr">
    <img src="https://img.shields.io/npm/v/taskr.svg" alt="NPM Version"/>
  </a>
  <a href="https://travis-ci.org/lukeed/taskr">
    <img src="https://img.shields.io/travis/lukeed/taskr.svg" alt="TravisCI"/>
  </a>
  <!-- <a href="https://codecov.io/github/lukeed/taskr"> -->
    <!-- <img src="https://img.shields.io/codecov/c/github/lukeed/taskr/master.svg" alt="Test Coverage"/> -->
  <!-- </a> -->
  <a href="https://ci.appveyor.com/project/lukeed/taskr/branch/master">
    <img src="https://ci.appveyor.com/api/projects/status/jjw7gor0edirylu5/branch/master?svg=true" alt="AppVeyor"/>
  </a>
  <a href="https://npmjs.org/package/taskr">
    <img src="https://img.shields.io/npm/dm/taskr.svg" alt="NPM Downloads"/>
  </a>
</div>

<div align="center">A generator & coroutine-based task runner.</div>
<div align="center"><strong>Fasten your seatbelt. :rocket:</strong></div>

<br />

Taskr is a highly performant task runner, much like Gulp or Grunt, but written with concurrency in mind. With Taskr, everything is a [coroutine](https://medium.com/@tjholowaychuk/callbacks-vs-coroutines-174f1fe66127#.vpryf5tyb), which allows for cascading and composable tasks; but unlike Gulp, it's not limited to the stream metaphor.

Taskr is extremely extensible, so _anything_ can be a task. Our core system will accept whatever you throw at it, resulting in a modular system of reusable plugins and tasks, connected by a declarative [`taskfile.js`](https://github.com/lukeed/taskr/tree/master/packages/taskr#taskfiles) that's easy to read.

```js
const src = 'src/{admin,client}';
const dist = 'build';

module.exports = {
  *lint(task) {
    yield task.source(`${src}/*.js`).xo({ esnext:true });
  },
  *scripts(task) {
    yield task.source(`${src}/*.js`).babel({ presets:['es2015'] }).target(`${dist}/js`);
  },
  *styles(task) {
    yield task.source(`${src}/*.sass`).sass().autoprefixer().target(`${dist}/css`);
  },
  *build(task) {
    yield task.parallel(['lint', 'scripts', 'styles']);
  }
}
```

## History

> **TL;DR** This is the continuation of and successor to [Taskr(https://github.com/flyjs/fly)!

I was forcibly removed by its inactive co-owner, due to his newfound "interest" in the project (aka, the stars). He's also taken to alter Fly's commit history in order to remove evidence of my work.

As a result of this dispute, Taskr exists as a separate (mono)repo but includes the full, _original_ history for Fly.

In regards the NPM downloadable(s), `taskr@1.0.5` is equivalent to `fly@2.0.6` -- with a few exceptions:

1. The `flyfile.js` has been renamed to `taskfile.js`;
2. The `fly` key inside `package.json` has been renamed to `taskr`. (See [Local Plugins](#https://github.com/lukeed/taskr/tree/master/packages/taskr#local-plugins))

At this point, the Fly & [Taskr ecosystems](#packages) are fully interchangeable, which means that you can install `taskr` and use any `fly-*` or `taskr-*` plugins of your choosing. That said, most plugins have been ported over to the new namespace.

Please bear with me as we, collectively, transition into a stronger and more stable product!

## Core Features

- **lightweight:** with `6` dependencies, installation takes seconds
- **minimal API:** Taskr only exposes a couple methods, but they're everything you'll ever need
- **performant:** because of [Bluebird](https://github.com/petkaantonov/bluebird/), creating and running Tasks are quick and inexpensive
- **cascadable:** sequential Task chains can cascade their return values, becoming the next Task's argument
- **asynchronous:** concurrent Task chains run without side effects & can be `yield`ed consistently
- **composable:** chain APIs and Tasks directly; say goodbye to `pipe()` x 100!
- **modular:** easily share or export individual Tasks or Plugins for later use
- **stable:** requires Node `>= 4.6` to run (LTS is `6.11`)

## Docs

The main documentation can be found in [`taskr`](/packages/taskr), our core package.

Each `@taskr/*` or `taskr-*` plugin will also include its own documentation, too!

## Packages

The Taskr repo is managed as a monorepo that is composed of its many _official_ packages.

> **Important:** The core pacakge is `taskr` and must be installed before using any additional plugins.

### Official Packages

These npm packages are officially released and maintained by the Taskr team.

If you can't find what you need, be sure to check out the [community list](#community-plugins) or browse for all [taskr-related plugins on `npmjs.com`](https://www.npmjs.com/browse/keyword/taskr-plugin), too!

If you're still missing something, open a ticket so that the team & community can try to help you... or create & share your own Taskr plugin! We have an awesome [Yeoman generator](https://github.com/lukeed/generator-taskr) to help speed up the process.

| Package | Version | Dependencies | Description |
|--------|-------|------------|-----------|
| [`taskr`](/packages/taskr) | [![npm](https://img.shields.io/npm/v/taskr.svg?maxAge=86400)](https://www.npmjs.com/package/taskr) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/taskr)](https://david-dm.org/lukeed/taskr?path=packages/taskr) | Core package. _Required_ |
| [`@taskr/babel`](/packages/babel) | [![npm](https://img.shields.io/npm/v/@taskr/babel.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/babel) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/babel)](https://david-dm.org/lukeed/taskr?path=packages/babel) | Babel plugin for Taskr |
| [`@taskr/browserify`](/packages/browserify) | [![npm](https://img.shields.io/npm/v/@taskr/browserify.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/browserify) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/browserify)](https://david-dm.org/lukeed/taskr?path=packages/browserify) | Browserify plugin for Taskr |
| [`@taskr/buble`](/packages/buble) | [![npm](https://img.shields.io/npm/v/@taskr/buble.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/buble) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/buble)](https://david-dm.org/lukeed/taskr?path=packages/buble) | Bublé plugin for Taskr |
| [`@taskr/clear`](/packages/clear) | [![npm](https://img.shields.io/npm/v/@taskr/clear.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/clear) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/clear)](https://david-dm.org/lukeed/taskr?path=packages/clear) | Remove one or more directories |
| [`@taskr/coffee`](/packages/coffee) | [![npm](https://img.shields.io/npm/v/@taskr/coffee.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/coffee) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/coffee)](https://david-dm.org/lukeed/taskr?path=packages/coffee) | CoffeeScript plugin for Taskr |
| [`@taskr/concat`](/packages/concat) | [![npm](https://img.shields.io/npm/v/@taskr/concat.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/concat) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/concat)](https://david-dm.org/lukeed/taskr?path=packages/concat) | Concatenate files with optional source maps. |
| [`@taskr/esnext`](/packages/esnext) | [![npm](https://img.shields.io/npm/v/@taskr/esnext.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/esnext) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/esnext)](https://david-dm.org/lukeed/taskr?path=packages/esnext) | Allows `async`/`await` syntax within `taskfile.js` |
| [`@taskr/flatten`](/packages/flatten) | [![npm](https://img.shields.io/npm/v/@taskr/flatten.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/flatten) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/flatten)](https://david-dm.org/lukeed/taskr?path=packages/flatten) | Flatten source files to a max of sub-dirs. |
| [`@taskr/gzip`](/packages/gzip) | [![npm](https://img.shields.io/npm/v/@taskr/gzip.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/gzip) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/gzip)](https://david-dm.org/lukeed/taskr?path=packages/gzip) | Gzip plugin for Taskr |
| [`@taskr/htmlmin`](/packages/htmlmin) | [![npm](https://img.shields.io/npm/v/@taskr/htmlmin.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/htmlmin) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/htmlmin)](https://david-dm.org/lukeed/taskr?path=packages/htmlmin) | Minify HTML with Taskr |
| [`@taskr/jest`](/packages/jest) | [![npm](https://img.shields.io/npm/v/@taskr/jest.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/jest) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/jest)](https://david-dm.org/lukeed/taskr?path=packages/jest) | Jest plugin for Taskr |
| [`@taskr/less`](/packages/less) | [![npm](https://img.shields.io/npm/v/@taskr/less.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/less) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/less)](https://david-dm.org/lukeed/taskr?path=packages/less) | Compile LESS to CSS with Taskr |
| [`@taskr/postcss`](/packages/postcss) | [![npm](https://img.shields.io/npm/v/@taskr/postcss.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/postcss) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/postcss)](https://david-dm.org/lukeed/taskr?path=packages/postcss) | PostCSS plugin for Taskr |
| [`@taskr/prettier`](/packages/prettier) | [![npm](https://img.shields.io/npm/v/@taskr/prettier.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/prettier) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/prettier)](https://david-dm.org/lukeed/taskr?path=packages/prettier) | Prettier plugin for Taskr |
| [`@taskr/rev`](/packages/rev) | [![npm](https://img.shields.io/npm/v/@taskr/rev.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/rev) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/rev)](https://david-dm.org/lukeed/taskr?path=packages/rev) | Version/Hash assets for cache-busting |
| [`@taskr/sass`](/packages/sass) | [![npm](https://img.shields.io/npm/v/@taskr/sass.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/sass) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/sass)](https://david-dm.org/lukeed/taskr?path=packages/sass) | Compile SASS to CSS with Taskr |
| [`@taskr/shell`](/packages/shell) | [![npm](https://img.shields.io/npm/v/@taskr/shell.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/shell) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/shell)](https://david-dm.org/lukeed/taskr?path=packages/shell) | Execute shell commands with Taskr |
| [`@taskr/stylus`](/packages/stylus) | [![npm](https://img.shields.io/npm/v/@taskr/stylus.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/stylus) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/stylus)](https://david-dm.org/lukeed/taskr?path=packages/stylus) | Compile Stylus to CSS with Taskr |
| [`@taskr/typescript`](/packages/typescript) | [![npm](https://img.shields.io/npm/v/@taskr/typescript.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/typescript) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/typescript)](https://david-dm.org/lukeed/taskr?path=packages/typescript) | Compile Typescript with Taskr |
| [`@taskr/uglify`](/packages/uglify) | [![npm](https://img.shields.io/npm/v/@taskr/uglify.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/uglify) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/uglify)](https://david-dm.org/lukeed/taskr?path=packages/uglify) | UglifyJS plugin for Taskr |
| [`@taskr/unflow`](/packages/unflow) | [![npm](https://img.shields.io/npm/v/@taskr/unflow.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/unflow) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/unflow)](https://david-dm.org/lukeed/taskr?path=packages/unflow) | Remove Flow type annotations with Taskr |
| [`@taskr/watch`](/packages/watch) | [![npm](https://img.shields.io/npm/v/@taskr/watch.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/watch) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/watch)](https://david-dm.org/lukeed/taskr?path=packages/watch) | Watch files & Execute specified tasks on change |
| [`@taskr/zip`](/packages/zip) | [![npm](https://img.shields.io/npm/v/@taskr/zip.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/zip) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/zip)](https://david-dm.org/lukeed/taskr?path=packages/zip) | ZIP compress files with Taskr |
| [`generator-taskr`](https://github.com/lukeed/generator-taskr) | [![npm](https://img.shields.io/npm/v/generator-taskr.svg?maxAge=86400)](https://www.npmjs.com/package/generator-taskr) | [![Dependency Status](https://david-dm.org/lukeed/generator-taskr.svg)](https://david-dm.org/lukeed/generator-taskr) | Official Yeoman generator |

### Community Plugins

| Package | Version | Dependencies | Description |
|--------|-------|------------|--------------|
| [`taskr-autoprefixer`](https://github.com/lukeed/taskr-autoprefixer) | [![npm](https://img.shields.io/npm/v/taskr-autoprefixer.svg?maxAge=86400)](https://www.npmjs.com/package/taskr-autoprefixer) | [![Dependency Status](https://david-dm.org/lukeed/taskr-autoprefixer.svg)](https://david-dm.org/lukeed/taskr-autoprefixer) | CSS Autoprefixer plugin for Taskr |
| [`taskr-nunjucks`](https://github.com/lukeed/taskr-nunjucks) | [![npm](https://img.shields.io/npm/v/taskr-nunjucks.svg?maxAge=86400)](https://www.npmjs.com/package/taskr-nunjucks) | [![Dependency Status](https://david-dm.org/lukeed/taskr-nunjucks.svg)](https://david-dm.org/lukeed/taskr-nunjucks) | Render Nunjucks templates with Taskr |
| [`taskr-precache`](https://github.com/lukeed/taskr-precache) | [![npm](https://img.shields.io/npm/v/taskr-precache.svg?maxAge=86400)](https://www.npmjs.com/package/taskr-precache) | [![Dependency Status](https://david-dm.org/lukeed/taskr-precache.svg)](https://david-dm.org/lukeed/taskr-precache) | Cache assets for offline use via service worker |
| [`taskr-svelte`](https://github.com/lukeed/taskr-svelte) | [![npm](https://img.shields.io/npm/v/taskr-svelte.svg?maxAge=86400)](https://www.npmjs.com/package/taskr-svelte) | [![Dependency Status](https://david-dm.org/lukeed/taskr-svelte.svg)](https://david-dm.org/lukeed/taskr-svelte) | Compile Svelte components with Taskr
| [`taskr-xo`](https://github.com/lukeed/taskr-xo) | [![npm](https://img.shields.io/npm/v/taskr-xo.svg?maxAge=86400)](https://www.npmjs.com/package/taskr-xo) | [![Dependency Status](https://david-dm.org/lukeed/taskr-xo.svg)](https://david-dm.org/lukeed/taskr-xo) | XO plugin for Taskr

## License

MIT © [Luke Edwards](https://lukeed.com)

<!--
  [`@taskr/eslint`](/packages/eslint) | [![npm](https://img.shields.io/npm/v/@taskr/eslint.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/eslint) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/eslint)](https://david-dm.org/lukeed/taskr?path=packages/eslint)
  [`@taskr/flow`](/packages/flow) | [![npm](https://img.shields.io/npm/v/@taskr/flow.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/flow) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/flow)](https://david-dm.org/lukeed/taskr?path=packages/flow)
  [`@taskr/rollup`](/packages/rollup) | [![npm](https://img.shields.io/npm/v/@taskr/rollup.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/rollup) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/rollup)](https://david-dm.org/lukeed/taskr?path=packages/rollup)
  [`@taskr/webpack`](/packages/webpack) | [![npm](https://img.shields.io/npm/v/@taskr/webpack.svg?maxAge=86400)](https://www.npmjs.com/package/@taskr/webpack) | [![Dependency Status](https://david-dm.org/lukeed/taskr.svg?path=packages/webpack)](https://david-dm.org/lukeed/taskr?path=packages/webpack)
  | -->
