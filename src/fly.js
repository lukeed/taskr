import co from "co"
import debug from "debug"
import mkdirp from "mkdirp"
import rimraf from "rimraf"
import chokidar from "chokidar"
import Emitter from "./emitter"
import { dirname, join, parse, sep } from "path"
import { readFile, appendFile, writeFile } from "mz/fs"
import { log, alert, error } from "fly-util"
import { defer, flatten, expand } from "fly-util"
const _ = debug("fly")

export default class Fly extends Emitter {
  /**
    Create a new Fly instance.
    @param {String} path to the flyfile
    @param {Object} loaded flyfile
    @param {[Function]} plugins
  */
  constructor ({ file = ".", host = {}, plugins = [] } = {}) {
    super()

    _("init ✈")
    this.debug = _
    this.tasks = {}
    this._filters = []
    this._writers = []
    this.encoding = process.env.ENCODING || "utf8"

    this.host = host instanceof Function
      ? Object.assign(host, { default: host }) : host

    Object.assign(this, { log, alert, error, defer, plugins })

    Object.keys(host).forEach((task) =>
      this.tasks[task] = host[task].bind(this))

    _("load %o", plugins)
    this.plugins = plugins
    plugins.forEach(({ name, plugin }) =>
      plugin.call(this, debug(name.replace("-", ":"))))

    this.root = dirname(file)
    process.chdir(dirname(this.file = file))
    _("switch to %o", process.cwd())
  }
  /**
    Use to compose a yieldable sequence.
    Reset globs, filters and writers.
    @param {...String} glob patterns
    @return Fly instance. Promises resolve to { file, source }
   */
   source (...globs) {
     _("source %o", globs)
     this._globs = flatten(globs)
     this._filters = []
     this._writers = []
     return this
   }
  /**
    Add a filter. If name is undefined, inject this[name].
    @param
      {String} name of the filter
      {Object} { transform, options, ext } object
      {Function} transform function
    @param [{Function}] transform function
  */
  filter (name, transform, { ext = "" } = {}) {
    if (name instanceof Function) {
      this.filter({ transform: name })
    } else if (typeof name === "object") {
      this._filters.push(name)
    } else {
      if (this[name] instanceof Function)
        throw new Error(`${name} method already defined in instance.`)
      this[name] = function (options) {
        return this.filter({ transform, options, ext })
      }
    }
    return this
  }
  /**
    Watch for IO events in globs and run tasks.
    @param {[String]} glob patterns to observe for changes
    @param {[String]} list of tasks to run on changes
    @param {Object} start options. See Fly.proto.start
  */
  watch (globs, tasks, options) {
    _("watch %o", globs)
    return this.emit("fly_watch").start(tasks, options)
      .then(() => chokidar.watch(flatten([globs]), { ignoreInitial: true })
        .on("all", () => this.start(tasks, options)))
  }

  /**
    Unwrap source globs.
    @param {Function} onFulfilled
    @param {onRejected} onFulfilled
  */
  unwrap (onFulfilled, onRejected) {
    _("unwrap %o", this._globs)
    return new Promise((resolve, reject) => {
      return Promise.all(this._globs.map(glob => expand(glob)))
        .then((result) => {
          _("%o", result)
          _("unwrap ✔")
          return resolve.apply(this, result)
        }).catch(reject)
      }).then(onFulfilled).catch(onRejected)
  }
  /**
    @private Execute a single task.
    @param {String} name of the task
    @param {Mixed} initial value to pass into the task
    @param {Object} Fly instance the task should be bound to
  */
  *exec (task, value, inject = this) {
    _("run %o", task)
    try {
      const start = new Date()
      this.emit("task_start", { task })
      value = (yield this.host[task].call(inject, value)) || value
      this.emit("task_complete", {
        task, duration: (new Date()).getTime() - start
      })
    } catch (error) { this.emit("task_error", { task, error }) }
    return value
  }
  /**
    Run one or more tasks. Each task's return value cascades on to
    the next task in a series.
    @param {Array} list of tasks
    @return {Promise}
   */
  start (tasks = "default", { parallel = false, value } = {}) {
    _("start %o in %o", tasks, parallel ? "parallel" : "sequence")
    return co.call(this, function* (tasks) {
      if (parallel) {
        yield tasks.map((task) =>
          this.exec(task, value, Object.create(this)))
      } else {
        for (let task of tasks)
          value = yield this.exec(task, value)
      }
      return value
    }, [].concat(tasks).filter((task) => ~Object.keys(this.host)
      .indexOf(task) || !this.emit("task_not_found", { task })))
  }
  /**
    Add a writer function to the collection of writers.
    @param {Generator} function yielding a promise
   */
  write (writer) {
    this._writers.push(writer.bind(this))
    return this
  }
  /**
    Rimraf paths.
    @param {...String} paths
   */
  clear (...paths) {
    _("clear %o", paths)
    const clear = this.defer(rimraf)
    return flatten(paths).map((path) => clear(path))
  }
  /**
    Concat read globs into one or more files.
    @param {[String]} array of name of target files
   */
  concat (name) {
    this.write(function* ({ path, source, target }) {
      _("concat %o", target)
      mkdirp.sync(path)// @TODO: should clear the target file to concat!
      yield appendFile(join(path, name), source, this.encoding)
      _("concat ✔")
    })
    return this
  }
  /**
    Resolve a yieldable sequence.
    Reduce source applying available filters.
    @param {Array} destination paths
    @return {Promise}
   */
  target (...dest) {
    if (this._writers.length === 0) {
      this.write(function* ({ target, source }) {
        _("write %o", target)
        mkdirp.sync(dirname(target))
        yield writeFile(target, source, this.encoding)
        _("write ✔")
      })
    }
    return co.call(this, function* () {
      _("target %o", dest)
      for (let glob of this._globs) {
        for (let file of yield expand(glob)) {
          _("file %o", file)
          const { dir, name, ext: _ext } = parse(file)
          const globCache = glob.split(sep)
          const { data, ext } = yield function* reduce (data, ext, filters) {
            const f = filters[0]
            return filters.length === 0
              ? {data, ext} : yield reduce.call(this, yield Promise.resolve(
                f.transform.call(this, data, f.options)),
                f.ext || ext, filters.slice(1), _("filter %s", f.transform))
          }.call(this, `${yield readFile(file)}`, _ext, this._filters)
          _("filter ✔")
          for (let path of flatten(dest)) {
            for (let write of this._writers) {
              yield write({
                path, source: data,
                target: join(path, join(...dir.split(sep).filter((p) =>
                  !~globCache.indexOf(p))), `${name}${ext}`)
              })
            }
          }
        }
      }
      _("done ✔")
    })
  }
}
