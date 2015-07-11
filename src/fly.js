import co from "co"
import fs from "mz/fs"
import mkdirp from "mkdirp"
import rimraf from "rimraf"
import { dirname, join, parse } from "path"
import Emitter from "./emitter"
import fmt from "./fmt"
import * as _ from "fly-util"

export default class Fly extends Emitter {
  /**
   * Create a new instance of Fly. Use fly.start(...) to run tasks.
   * @param {Object} Flyfile, also known as host
   * @param {String} relative base path / root
   * @param {Array} list of plugins to load.
   */
  constructor ({ host, root = "./", plugins = [] }) {
    super()
    this.defer = _.defer
    this.encoding = process.env.ENCODING || "utf8"
    this.host = this.tasks = host instanceof Function
      ? Object.assign(host, { default: host }) : host

    Object.keys(host).forEach((task) =>
      this.tasks[task] = this.host[task] = host[task].bind(this))

    process.chdir(this.root = root)
    plugins.forEach((plugin) => plugin.call(this))
  }
  /**
   * Log a message with a time stamp.
   */
  log (...args) {
    _.log(`[${fmt.time}] ${args}`)
    return this
  }
  /**
   * Rimraf paths.
   * @param {...String} paths
   */
  clear (...paths) {
    const _clear = this.defer(rimraf)
    return paths.map((path) => _clear(path))
  }
  /**
   * Concatenates files read via source.
   * @param {String} name of the concatenated file
   * @TODO: by default this operation should clear the target file to concat
   */
  concat (name) {
    this.write(function* ({ path, source }) {
      mkdirp.sync(path)
      yield fs.appendFile(join(path, name), source, this.encoding)
    })
    return this
  }
  /**
   * Append a writer to be applied after the globs are expanded and sources
   * read. Examples of writers are the default IO writer and concat.
   * @param {Generator} function yielding a promise.
   */
  write (writer) {
    this._writers.push(writer.bind(this))
    return this
  }
  /**
   * Add a transformer filter. If specified by name and Fly.prototype[name]
   * is undefined, extends prototype with a method closing on filter.
   * @param
   *   {String} name of the filter.
   *   {Object} { filter, options } object.
   *   {Function} filter function.
   * @param [{Function}] filter function.
   */
  filter (name, filter, { ext = "" } = {}) {
    if (name instanceof Function) {
      this.filter({ filter: name })
    } else if (typeof name === "object") {
      this._filters.push(name)
    } else {
      if (this[name] instanceof Function)
        throw new Error(`${name} method already defined in instance.`)
      this[name] = (options) => this.filter({ filter, options, ext })
    }
    return this
  }
  /**
   * Watch for IO events in globs and run tasks.
   * @param {Array:String} glob patterns to observe for changes
   * @param {Array:String} list of tasks to run on changes
   */
  watch (globs, tasks) {
    this.notify("fly_watch").start(tasks)
      .then(() => _.watch(globs, { ignoreInitial: true })
        .on("all", () => this.start(tasks)))
    return this
  }
  /**
   * Run tasks. Each task's return value cascades on to the next task in
   * a series. Can be yielded inside a task.
   * @param {Array} list of tasks to run
   * @return {Promise}
   */
  start (tasks = []) {
    if (tasks.length === 0) tasks.push("default")
    return co.call(this, function* (ret) {
      for (const task of []
        .concat(tasks)
        .filter((task) => {
          return ~Object.keys(this.host).indexOf(task)
          || !this.notify("task_not_found", { task })
      })) {
        const start = new Date()
        this.notify("task_start", { task })
        try {
          ret = yield this.tasks[task].call(this, ret)
          this.notify("task_complete", {
            task, duration: (new Date()).getTime() - start
          })
        } catch (error) { this.notify("task_error", { task, error }) }
      }
    })
  }
  /**
   * Compose a yieldable sequence. Initialize globs, filters and writers.
   * @param {...String} glob patterns
   * @return Fly instance. Promises resolve to { file, source }
   */
   source (...globs) {
     this._globs = _.flatten(globs)
     this._filters = []
     this._writers = []
     return this
   }
   /**
    * Unwrap the source globs.
    * @param {Function} onFulfilled
    * @param {onRejected} onFulfilled
    */
    unwrap (onFulfilled, onRejected) {
      return new Promise((resolve, reject) => {
        Promise.all(this._globs.map(glob => _.expand(glob)))
          .then((result) => resolve.apply(this, result)).catch(reject)
      }).then(onFulfilled).catch(onRejected)
    }
  /**
   * Yield expanded glob promises and filter-reduce sources.
   * @param {Array} destination paths
   * @param {Boolean} apply filters to each glob pattern in parallel
   */
   *target (dest, { parallel = false } = {}) {
     const go = (glob, dest) => {
       const base = (_ => _.length ? "" : _.shift())(glob.split("*"))
       return function* () {
         for (const file of yield _.expand(glob)) {
           yield function* reduce (source, filters, ext = "") {
             if (filters.length === 0) {
               for (const path of dest) {
                 const target = (file =>
                   join(path, `${file.name}${ext ? ext : file.ext}`)
                 )(parse(file))
                 if (!this._writers.length) {
                   this.write(function* ({ target, source }) {
                      mkdirp.sync(dirname(target)) // TODO cache?
                      yield fs.writeFile(target, source, this.encoding)
                   })
                 }
                 yield this._writers.map((write) =>
                   write({ path, target, base, file, source }))
               }
             } else {
               const _ = filters[0]
               yield function* (filter, ext) {
                 yield reduce.call(this, filter instanceof Promise
                   ? yield filter
                   : filter, filters.slice(1), ext)
               }.call(this, _.filter.apply(this,
                 [source, _.options]), _.ext)
             }
           }.call(this, `${yield fs.readFile(file)}`, this._filters)
         }
       }.call(this)
     }
     if (parallel) {
         yield this._globs.map((glob) => go(glob, _.flatten(dest)))
     } else {
       for (const glob of this._globs) {
         yield go(glob, _.flatten(Array.isArray(dest) ? dest : [dest]))
       }
     }
   }
}
