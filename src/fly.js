import co from "co"
import debug from "debug"
import rimraf from "rimraf"
import chokidar from "chokidar"
import Catenator from "concat-with-sourcemaps"
import { dirname, join, parse, sep } from "path"
import { readFile, appendFile } from "mz/fs"
import { log, alert, error, defer, flatten, expand } from "fly-util"
import Emitter from "./emitter"
import write from "./write"
const clear = defer(rimraf)
const _ = debug("fly")

export default class Fly extends Emitter {
  /**
    Create a new Fly instance.
    @param {String} flyfile path
    @param {Object} flyfile module
    @param {[Function]} array of plugins
  */
  constructor ({ file = ".", plugins = [], host = {} } = {}) {
    super(/* ✈ */)
    Object.assign(this, {
      log, alert, error, defer, file, plugins,
      root: dirname(file),
      host: host instanceof Function
        ? Object.assign(host, { default: host })
        : host,
      debug: _,
      tasks: Object.keys(host).reduce((_, key) =>
        Object.assign(_, { [key]: host[key].bind(this) }), {}),
      _: { filters: [] }
    })
    plugins.forEach(({ name, plugin }) => {
      if (!plugin) throw new Error(`Did you forget to npm i -D ${name}?`)
      plugin.call(this, debug(name.replace("-", ":")), _("load %o", name))
    })
    _("chdir %o", this.root)
    process.chdir(this.root)
  }
  /**
    Compose a new yieldable sequence.
    Reset globs, filters and writer.
    @param {...String} glob patterns
    @return Fly instance. Promises resolve to { file, source }
   */
   source (...globs) {
     Object.assign(this, { _: { write, filters: [], globs: flatten(globs) }})
     this._.catenator = undefined
     _("source %o", this._.globs)
     return this
   }
  /**
    Add filter / transform function.
    Create a closure bound to the current Fly instance.
    @param {String|Function} name or filter callback
    @param [{Function}] callback with the signature (cb, options) => {}
  */
  filter (name, cb) {
    if (name instanceof Function) this.filter({ cb: name })
    else if (typeof name === "object") this._.filters.push(name)
    else {
      if (this[name] instanceof Function)
        throw new RangeError(`${name} method already defined in instance.`)
      this[name] = function (options, ...rest) {
        debug("fly")(`${name} %o, %o`, options, rest)
        return this.filter({ cb, options, rest })
      }
    }
    return this
  }
  /**
    Watch IO events in globs and run tasks.
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
    Unwrap/expand source globs to files.
    @param {Function} onFulfilled
    @param {Function} onRejected
  */
  unwrap (onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      return Promise.all(this._.globs.map(glob => expand(glob)))
        .then((files) => resolve.call(this, files.reduce((arr, item) =>
          arr.concat(item)))).catch(reject)
      }).then(onFulfilled).catch(onRejected)
  }
  /**
    @private Execute a task.
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
    Run one or more tasks. Each task's return value cascades on to the next
    task in a sequence.
    @param {Array} list of tasks
    @return {Promise}
   */
  start (tasks = "default", { parallel = false, value } = {}) {
    _(`start %o in ${parallel ? "parallel" : "sequence"}`, tasks)
    return co.call(this, function* (tasks) {
      if (parallel) {
        yield tasks.map((task) =>
          this.exec(task, value, Object.create(this)))
      } else {
        for (let task of tasks) value = yield this.exec(task, value)
      }
      return value
    }, [].concat(tasks).filter((task) => ~Object.keys(this.host)
      .indexOf(task) || !this.emit("task_not_found", { task })))
  }
  /**
    Deferred rimraf wrapper.
    @param {...String} paths
   */
  clear (...paths) {
    _("clear %o", paths)
    return flatten(paths).map((path) => clear(path))
  }
  /**
    Writer based in fs/mz appendFile.
    @param {String} file name
   */
  concat (base) {
    this._.catenator = new Catenator(true, base, "\n")
    this._.write = function* ({ dir, data, map }) {
      yield write({ dir, base, data, map, write: appendFile })
    }
    return this
  }
  /**
    Resolve a yieldable sequence.
    Reduce source with filters and invoke writer.
    @param {Array} target directories
    @return {Promise}
   */
  target (...dirs) {
    return co.call(this, function* () {
      for (let glob of this._.globs) {
        for (let file of yield expand(glob)) {
          let { base, ext } = parse(file), data = yield readFile(file)
          let concat = this._.catenator || new Catenator(true, base, "\n")

          for (let filter of this._.filters) {
            const options = (filter.options || {}).sourceMap
              ? Object.assign({ filename: base }, filter.options)
              : filter.options
            const res = yield Promise.resolve(
              filter.cb.apply(this, [data, options].concat(filter.rest)))

            data = res.code || res.js || res.css || res.data || res || data
            ext = res.ext || res.extension || ext

            if (res.map) {
              concat.add(`${base}`, data, res.map)
              if (ext === ".css")
                data += `\n/*# sourceMappingURL=${base}.map*/\n`
              if (ext === ".js")
                data += `\n//# sourceMappingURL=${base}.map\n`
            }
          }

          for (let dir of flatten(dirs)) {
            yield this._.write({
              dir, data,
              base: join(...parse(file).dir.split(sep)
                .filter((path) => !~glob.split(sep).indexOf(path)),
                `${parse(file).name}${ext}`),
              map: concat.contentParts.length && concat.sourceMap
            })
          }
        }
      }
    })
  }
}
