<div align="center">
  <a href="http://github.com/flyjs/fly">
    <img width=100px  src="https://cloud.githubusercontent.com/assets/8317250/8733685/0be81080-2c40-11e5-98d2-c634f076ccd7.png">
  </a>
</div>


<p align="center">
<b><a href="#概要">概要</a></b>
|
<b><a href="#flyfiles">Flyfiles</a></b>
|
<b><a href="#cli">CLI</a></b>
|
<b><a href="#api">API</a></b>
|
<b><a href="#プラグイン">プラグイン</a></b>
|
<b><a href="README.md">English</a></b>


# Documentation

Flyは、[gulp](http://gulpjs.com/)や[Grunt](http://gruntjs.com/) [等](https://gist.github.com/callumacrae/9231589)と似た手法でタスクを自動化するツールです。

gulpのように、Flyは設定よりもコードを優先しますが、タスクを記述し構成するための、よりシンプルで決定的な方法を提供するために作られました。<br>

# 概要

Flyはほかのビルドシステムによくある、[stream](https://nodejs.org/api/stream.html)ベースのインプリメンテーションを回避し、promiseと[co-routines](https://github.com/tj/co)によるフローコントロールベースのジェネレーターを採用しました。

Flyは ES6で書かれていますが、モジュールは ES6で書く必要はありません。<br>
Flyは[pipeline](https://www.google.co.jp/search?q=pipeline+code&espv=2&biw=1186&bih=705&source=lnms&tbm=isch&sa=X&ei=L7-SVde6JqPpmQXHyrLIBg&ved=0CAcQ_AUoAg&dpr=2&gws_rd=cr#tbm=isch&q=pipeline+build+system&imgrc=923J2oOnaU_VXM%3A)の順序で構成するものですが、streamを強制するものではありません。


```js
exports.scripts = function* () {
  yield this
    .source("src/**/*.coffee")
    .coffee({/* ... */})
    .uglify({/* ... */})
    .concat("all.min.js")
    .target("dist/js")
}
```
*streamにあまり当てはまらないタスクの例として、コード分析、ユニットテスト、リンティング(静的コードチェック)などがあげられます。*

+ Flyは[generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)と[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) のサポートが必要なため、少なくともNode v0.11 以上が必要です。

+ フィルタ系プラグインを作成する際には、`Fly.prototype.filter`を使いながら、パイプラインに簡単に自分のトランスフォーム関数をつなぐことができます。

+ Asyncのサブプロセスはbuilt-in methodに
`Fly.prototype.defer`を使うと、promiseに自動的に送ることができます。

+ タスクはgenerator functionsで記述されており、promiseを返すオペレーションは[yield](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)で作成されています。

```js
exports.task = function* () {
  yield this.task.deploy()
}
```

+ Pluginsは自動的にrequireされ、タスクの中で、`this.pluginName`のような形で動作します。その際は`node_modules` 、`package.json` の設定が必要です。

+ `npm i fly-*`をするだけで、Flyの実行時にプラグインを呼び出すことができます。

+ JSDoc syntax `/** @desc description */`を使ってタスク記述を追加することができます。

	```js
	exports.task = function* () {
	  /** @desc Does something. */
	}
	```

#Flyfiles

他のシステムのように、Flyは、Flyfileをロードし、タスクを作動させます。
Flyfileはそのタスクをgenerator functionsとしてエクスポートします。

```js
exports.myTask = function* () {
  yield this.source("a").target("b")
}
```

Flyfileのサンプルは、`examples/` を参照してください。

#CLI
Flyをインストールすると、ターミナルで `fly [options] [tasks]` を使ってCLIにアクセスすることができます。

```
fly task1 task2 ...
```

Flyの現在のサポートは以下の通りです。

### `-h --help`

helpを表示します。

### `-f --file` `<path>`

Flyfileを交互に使用します。

`fly -f examples/`

もしくは、`fly -f path/to/Flyfile`

### `-l --list``[=simple]`

使用可能なタスクを表示します。タスクを簡素に見たい場合は、 `--list=simple` を使用します。

> shell completionsを書くときに便利です。

### `-v --version`

Flyfileがあれば、version numberを表示します。


# API
[![][codeclimate-badge]][codeclimate]

Flyはビルトインタスク`clear`、`concat`、`filter`のように、クリエイティブに、実際に操作できる多くのメソッドを提供します。


### `Fly.prototype.constructor`

新しいFlyのインスタンスを作ります。

### Options

##### `host`

ロードされた*Flyfile*。

##### `root`

関連性のあるbase path / rootの比較。

##### `plugins`

ロードするpluginのリスト。

### `Fly.prototype.log (...args)`

timestampを使ってメッセージをログします。

### `Fly.prototype.concat (name)`

`Fly.prototype.source`を使ってファイルを連結します。

### `Fly.prototype.filter (name, filter)`

sync filterを追加、promise-pipelineに変換します。
async filtersの為には、`Fly.prototype.defer` もしくは自身で関数を用いて、ファンクションをpromiseに変える必要があります。

まず、ファンクションを通過することができ、そしてFlyはそれを正確に
フィルターコレクションに追加します。

### `Fly.prototype.watch ([globs], [tasks])`

`glob`から拡張された行程で変更が検出された時、指定のタスクを動します。

### `Fly.prototype.start (tasks)`

もし`tasks.length === 0`ならば`tasks` もしくは`default` / `main` 内で指定された全てのタスクを作動させます。

### `Fly.prototype.source (...globs)`

1つもしくはそれ以上のオペレーションを、promise-pipelineへ追加します。

それぞれのファイルは、再帰フィルターで解決されるpromiseへと誘導されている。各再帰フィルターは応用され、その後`{ file, data }` オブジェクトを作り出す。
`globs`は分割されたふたつのコンマ、もしくは行となります。

`globs` はは分割されたふたつのコンマ、もしくはglobsの一行となります。


### `Fly.prototype.reset ()`

Fly instanceの内部ステートをリセットします。

###`Fly.prototype.clear (...paths)`

[rimraf](https://github.com/isaacs/rimraf)のラッパー。
指定のdirectoryを消します。

###`Fly.prototype.concat (name)`

`Fly.prototype.source`でファイルを連結します。

###`Fly.prototype.filter (name, filters)`

sync filterを追加する。promise-pipelineに変えます。<br>

async filtersは、`Fly.prototype.defer` を例のように使ってfunctionをpromiseへwrapする必要があります。


### `Fly.prototype.start (tasks = [])`

指定された全てのタスク、`tasks` 、`the default`、`tasks.length === 0`を実行します。


### `Fly.prototype.unwrap (promises)`

promiseの配列の解決は結果をもって新しいpromiseに戻ります。
このメソッドはpluginを作るときにも使えます。
このメソッドは、プロミスソースが`Fly.prototype.target`で解かれる前に読みこむ事が必要なプラグインを作成する際に、使うことができます。例えばコード分析やlintingやtesting等です。


### `Fly.prototype.target (...dest)`

すべてのsource promisesの解決し、それぞれの進路の到着点を書きます。
`dest` は分割されたふたつのコンマ、もしくは進路の到着点の行となります。

# プラグイン

> pluginのリストのために[wiki](https://github.com/flyjs/fly/wiki)を見る、もしくは新しい[packages](https://www.npmjs.com/search?q=fly-)のためにレジストリを探す。

> この [gist](https://gist.github.com/bucaran/f018ade8dee8ae189407) はFly pluginsのREADMEテンプレートです。


Pluginはひとつのデフォルトメソッドを出力する定型のnodeモジュールです。このメソッドは新しいFlyのインスタンスが作られた際に、自動的に実行されます。

```js
module.exports = function () {
  return this.filter("myPlugin", (src, opts) => {
    try { return ... }
    catch (e) { throw e }
  })
}
```


> もしメソッドが`source..target`pipeline (上記の例、 既に返っている`Fly.prototype.filter` ）でコンポーズされるべき場合、このように返ることを確実にします。


もしメソッドがタスクの中で *yield* されるべきならば、promiseを返す必要があります。


```js
module.exports = function () {
  this.method = function (opts) {
    return new Promise((resolve, reject) => {...})
  }
}
```

[codeclimate-badge]: https://codeclimate.com/github/flyjs/fly/badges/gpa.svg
[codeclimate]: https://codeclimate.com/github/flyjs/fly
