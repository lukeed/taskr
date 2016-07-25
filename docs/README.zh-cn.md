<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=100px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>


<p align="center">
<b><a href="#features">特性</a></b>
|
<b><a href="#flyfiles">Flyfiles</a></b>
|
<b><a href="#cli">CLI</a></b>
|
<b><a href="#api">API</a></b>
|
<b><a href="#plugins">插件</a></b>
|
<b><a href="#hacking">Hacking</a></b>
|
<b><a href="README.md">English</a></b>
|
<b><a href="README.ja.md">日本語</a></b>


# 概要
_Fly_ 是一款类似于 [Gulp](http://gulpjs.com/), [Grunt](http://gruntjs.com/), [etc](https://gist.github.com/callumacrae/9231589) 的自动化构建工具。

_Fly_ 是一个全新的项目，从底层开始，全部用ECMAScript 5重新构建，具备 generator 和 promise 的优势。

_Fly_ 与 Gulp 类似, 使用 _代码_ 来作为配置文件。

## 特性

> Fly 依赖 [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) 和 [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 的支持, 即 `iojs` / `node >= 0.11`.

* Fly 不同于其他构建系统，没有使用基于 [stream](https://nodejs.org/api/stream.html) 的控制流实现，而是通过 [co-routines](https://github.com/tj/co) 采用了基于 promises 和 generator 的实现。

* Fly 本身是纯 ECMAScript5 写成的, 因此非常轻量和快速。它不需要安装一大堆依赖，却能比 Gulp/Grunt 等同类工具都要快。

+ 默认情况下, 任务（Task）用 [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) 函数描述，通过 [`yield`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield) 来控制异步控制流:

  ```js
  module.exports.default = function * () {
    yield this.source("index.js").uglify().target("dist")
  }
  ```

+ Fly 允许任务返回值的串联。一个任务的返回值将作为执行序列中下一个任务的参数。

  ```js
  var x = module.exports

  x.default = function * () {
    yield this.start(["first", "second"])
  }

  x.first = function * () {
    return { secret: 42 }
  }

  x.second = function * ({ secret }) {
    this.log(`The secret is ${secret}`)
  }
  ```

+ Fly API 允许你像使用管道一样组合任务，不受限于 stream 的表达力。

  ```js
  module.exports.default = function * () {
    yield this
      .source("src/**/*.js")
      .eslint()
      .uglify()
      .concat("all.min.js")
      .target("dist")
  }
  ```

+ Fly 支持并发执行任务，使用 `Fly.prototype.start([tasks], { parallel: true })`:

  ```js
  module.exports.default = function * () {
    yield this.start(["task1", "task2", "task3"], { parallel: true })
  }
  ```

+ 使用 `Fly.prototype.filter(Function)` 来对序列进行变换。如果你需要操作异步函数，需使用 `Fly.prototype.defer` 来进行一次包裹。

+ 插件是自动加载的 -- 只需在 `package.json` 中记录依赖，以及安装到 `node_modules`。

+ 使用 JSDoc 的 `/** @desc description */` 来描述任务。在终端中使用 `fly -l` 显示这些说明。

  ```js
  module.exports.task = function * () {
    /** @desc This is the task description. */
  }
  ```

## _Flyfiles_

和其他构建系统类似， _Fly_ 读入一个名为 `flyfile.js` (大小写敏感) 的文件来执行任务。

默认情况下, Fly 只支持 [ES5](#es5-example) 语法的 flyfile。 不过你想使用 [ES6](#es6-example) 或者 [ES7](#es7-example) 的话, 只需要安装 [fly-esnext](https://github.com/lukeed/fly-esnext) 就行啦!

### ES5 例子

Flyfile 以 generator 函数来导出其任务:

```js
module.exports.default = function * () {
  yield this.source("*")...target("./")
}

// 或者
exports.default = function * () {
  yield this.source("*")...target("./")
}

// 或者
var x = module.exports;
x.default = function * () {
  yield this.source("*")...target("./")
}
```

建议使用一个 `paths` 对象来管理任务相关的路径。

```js
var x = module.exports
var paths = {
  css: {
    src: 'src/styles/*.css',
    dist: 'dist/css'
  },
  js: {
    src: 'src/scripts/*.js',
    dist: 'dist/js'
  }
}

x.default = function * () {
  yield this.start('styles', 'scripts')
}

x.styles = function * () {
  yield this.source(paths.css.src)
    // ...
    .concat('main.css')
    .target(paths.css.dist)
}

x.scripts = function * () {
  yield this.source(paths.js.src)
    .eslint()
    // ...
    .concat('main.js')
    .target(paths.js.dist)
}
```
> 这也意味着你可以把路径相关配置分离到 flyfile 之外，然后在 flyfile 里面 `require()` 你的路径配置。

### ES6 例子

```js
const paths = {
        scripts: ["src/*.js", "!src/ignore.js"]
}

export default function * () {
        yield this.start("lint")
  yield this.source(paths.scripts)...target("dist")
}

export function * lint() {
        yield this....
}
```

### ES7 例子

```js
const paths = {
        scripts: ["src/*.js", "!src/ignore.js"]
}

export default async function () {
        await this.start("lint")
  await this.source("*")...target("./")
}

export async function lint() {
        await this....
}
```

更多例子请查看 `examples/` 。

## CLI

安装 Fly 之后，你可以通过 `fly [options] [tasks]` 来执行任务：

```
fly task1 task2 ...
```

Fly 支持下列选项：

#### `-h  --help`

显示帮助。

#### `-f  --file` `<path>`

使用指定位置的 flyfile。

```
fly -f examples/
```

或者

```
fly -f path/to/another/Flyfile.js
```

#### `-l  --list[=bare]`

显示所有任务。

#### `-v  --version`

显示版本号。

## API

### IO

#### `Fly.prototype.source (...globs)`

产生一个 _yieldable_ 序列。

```js
module.exports.default = function * () {
  yield this.source("styles/*.scss", "styles/*.sass")...
}
```

#### `Fly.prototype.target (targets[, {config}])`

结束一个 _yieldable_ 序列。将源数据应用前面的 filter 之后写入到 `targets` 。

**targets**

> Type: `string` or `array`

> Default: `null`

要写入的目标目录。

**config** -- Optional

> Type: `object`

> Default: `{}`

目标目录的可选配置。

**config.depth**

> Type: `integer`

> Default: `-1`

源数据的父目录层数，见 [Depths](#depths)。

```js
exports.default = function * () {
  yield this
    .source("*")
    ...
    .filter(function (data) {
      return data.toString()
    })
    ...
    .target(["dist", "build", "test"])
}
```

#### `Fly.prototype.concat (name)`

串联 `Fly.prototype.source` 读入的文件。

#### `Fly.prototype.clear (...paths)`

清空/删除所有 paths 中的目录及子目录。

```js
module.exports.default = function * () {
  yield this.clear("dist/main.js", "dist/plugins/**/*.js");
  ...
}
```

### Depths

如果有 `config` 参数，则输入文件的目录结构不一定跟预期输出相同。默认情况下，如果没有 `config` 参数，源输入的目录结构将保持不变。

你可以通过指定 `depth` 的值类规定输入文件保留多少级目录。

在处理字体和图片的时候，经常会需要修改或者扁平化输出目录的结构。让我们来看下面这个处理项目图片目录结构的例子：

```
app
|- images/
  |- img.jpg
  |- one/
    |- one.jpg
    |- two/
      |- two.jpg
```

#### Depth: Default

```js
yield this.source('app/images/**/*.jpg').target('dest/img')
```
`dest/img` 的内容是:
* `img.jpg`
* `one/`

#### Depth: 0
```js
yield this.source('app/images/**/*.jpg').target('dest/img', {depth: 0})
```
`dest/img` 的内容是:
* `img.jpg`
* `one.jpg`
* `two.jpg`

#### Depth: 1
```js
yield this.source('app/images/**/*.jpg').target('dest/img', {depth: 1})
```
`dest/img` 的内容是:
* `img.jpg`
* `one/`
* `two/`

#### Depth: 2
```js
yield this.source('app/images/**/*.jpg').target('dest/img', {depth: 2})
```
`dest/img` 的内容是:
* `img.jpg`
* `one/`

---

**注意：** 在这个例子中，所有超过 `depth: 2` 的值都会保留原来的目录结构，因为源目录的最大深度是 2。

---


### 过滤器

#### `Fly.prototype.filter (filter)`

向 `source → target` 序列之间插入一个异步/同步的变换。使用 `Fly.prototype.defer (Function)` 来令异步函数返回 promise。

> 概念上和 stream 类似，过滤器接收一个数据源，然后通常输出 _变换过的_ 数据。

> 如果过滤器/插件是在处理文本，那么它们还将负责将传入的源数据转换为 `String`。

```js
module.exports.default = function * () {
  yield this
    .source("*.txt")
    .filter(function (data) {
      return data.replace(/(\w+)\s(\w+)/g, "$2 $1")
     })
    .target("swap")
}
```

上面这个例子读入所有当前目录的文本文件，并两两交换其中的单词。

#### 命名的过滤器

你可以通过 `Fly.prototype.filter (name, filter)` 给过滤器命名，这会向当前的 Fly 实例注入名为 `name` 的方法。

> 这个特性通常用在过滤器插件中。

> 如果同名的方法已经存在，那么 Fly 会抛出一个 RangeError

### 任务

#### `Fly.prototype.start ([tasks], options)`

执行特定名字的任务（或者在 `tasks.length === 0` 时，执行名为 `default` 的任务）。

  + 可以在别的任务内部 yield 出去。

  ```js
  module.exports.default = function * () {
    yield this.start(["lint", "test", "build"])
  }
  ```

#### 选项

>>>>>>>>>>>>>>>>>>暂待上游修正
  + Use the `value` option to pass a value into the first task. Return values cascade on to subsequent tasks.

  ```js
  module.exports.default = function * () {
    yield this.start(["a", "b", "c"])
    ...
    return 42
  }

  module.exports.default = function * (secret) {
    this.log(`The secret is ${secret}`) // The secret is 42
  }
  ```
<<<<<<<<<<<<<<<<<<暂待上游修正

  + 使用 `parallel: true` 选项来同时执行多个任务。下面这个例子让 `html`, `css` and `js` 三个任务同时执行。

  ```js
  module.exports.default = function * () {
    yield this.start(["html", "css", "js"], {parallel: true})
  }
  ```

#### `Fly.prototype.watch (globs, tasks, options)`

在 globs 中的任一文件发生变化的时候，执行执行指定的任务。返回一个 promise。

> 注： `tasks` 和 `options` 会被传递给 `Fly.prototype.start`

```js
module.exports.watch = function * () {
 yield this.watch("app/lib/**/*.scss", "styles");
 yield this.watch("app/lib/**/*.js", ["js", "lint"], {parallel: true});
}
```


### 其他
#### `Fly.prototype.unwrap (onFulfilled, onRejected)`

展开 source globs，返回一个 promise。

对于需要展开 source globs 的插件，就可以使用这个方法。例如 linting/测试一类的插件。

```js
module.exports = function () {
  this.myLint = function (options) {
    var lint = createLinter(options)
    return this.unwrap(function (files) {
            files.forEach(function (f) {
                    lint(f)
            })
    })
  }
}
```

### Instrumentation

#### `Fly.prototype.log (...args)`
输出一条带时间戳的日志。

#### `Fly.prototype.error (...args)`
输出一条带时间戳的错误日志。

#### `Fly.prototype.alert (...args)`
在 `process.env.VERBOSE` 的时候，输出一条带时间戳的日志。

#### `Fly.prototype.debug (...args)`

输出一条 debug 日志。 设定 `DEBUG="*"` 或者 `DEBUG="fly*"` 来过滤 debug 日志。对于详细使用方式可以查阅 [`debug`](https://github.com/visionmedia/debug) 的文档。



## 插件

> 请使用我们的 [generator](https://github.com/flyjs/generator-fly) 来搭建新的插件。

> 使用关键字 ["fly"](https://www.npmjs.com/browse/keyword/fly) 来寻找新插件。

> Fly 的插件默认只支持 ES5 语法。如果要使用/编写 ES6/ES7 插件，安装 (fly-esnext)[https://github.com/lukeed/fly-esnext].

插件是至少 export 一个 default 方法的 node 模块。其方法会在 Fly 创建新实例的时候，绑定到当前的实例上。

```js
module.exports = function () {
  this.myPlugin = function (data) {/* process raw data */}
}
```

通过 `Fly.prototype.filter` 来避免和已有的同名插件冲突。

> 在处理文本的时候，过滤器/插件负责转化输入的源数据到 `String`。

```js
module.exports = function () {
  return this.filter("myFilter", function (data, options) {
    return {code /* or `css` or `data` */, ext, map}
  })
}
```

如果一个方法需要在一个任务中能够 _yield_ ，则必须返回一个 promise。

```js
module.exports = function () {
  this.myPlugin = function (options) {
    return new Promise(function (resolve, reject) {/* ... */})
  }
}
```

如果一个插件不属于以上类型，那么它必须返回 `this` 来保证链式调用的支持。

```js
module.exports = function () {
  var self = this
  this.notify = function (options) {
    // ...
    return self
  }
}
```

### 异步函数

用 `Fly.prototype.defer` 来包装异步函数。它会创建一个返回 promise 的新函数。带着 `source` 和 `options` 调用这个函数即可。

```js
this.filter("myPlugin", (data, options) {
  var self = this
  return self.defer(myFilter)(data, options)
})
```

### ES6/ES7 插件

如果一个插件出现了语法错误，很可能因为它使用了 ES6 或 ES7 语法。安装 [fly-esnext](https://github.com/lukeed/fly-esnext) 可以解决这个问题。

_ES6/ES7 例子_:

```js
export default function () {
  this.filter("myPlugin", (data, options) => {
    return this.defer(myFilter)(data, options)
  })
}

export default function () {
  this.myPlugin = (options) => new Promise((resolve, reject) => {
    // ...
  })
}

export default function () {
  this.notify = (options) => {
    return this
  }
}
```

## Hacking

```
git clone https://github.com/flyjs/fly
npm run setup
fly -v
```

>>>>>>>>>>>>>>>>待上游更新
上面命令 clone 了 fly 仓库，还会安装依赖，执行测试，以及创建 `bin/index.js` 的软链接到 `usr/local/bin/fly` ，让你能够在任意目录执行 `fly`。

> To undo this run `rm /usr/local/bin/fly`.
<<<<<<<<<<<<<<<<待上游更新


通过 _Fly_ 安装使用用例:

```
fly -f examples
```

执行任意用例 examples:

```
fly -f examples/babel
```

你可以查阅 [quickstart guide][quickstart] 来上手 Flyfiles 的编写。

:metal:



[quickstart]: https://github.com/flyjs/fly/wiki/Quickstart
