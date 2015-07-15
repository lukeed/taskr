import co from "co"
import mkdirp from "mkdirp"
import rimraf from "rimraf"
import Emitter from "./emitter"
import { dirname, join, parse } from "path"
import { readFile, appendFile, writeFile } from "mz/fs"
import { log, warn, error, debug, defer, flatten, expand, watch } from "fly-util"

const ENCODING = process.env.ENCODING || "utf8"

export default class Fly extends Emitter {
  /**
   * Create new instance. Use fly.start(...) to run tasks.
   * @param {Object} Flyfile, also known as host
   * @param {String} relative base path / root
   * @param {Array} list of plugins to load.
   */
  constructor ({ host, root = "./", plugins = [] }) {
    super()
    process.chdir(this.root = root)
    this.tasks = {}
    this.host = host instanceof Function
      ? Object.assign(host, { default: host }) : host
    Object.assign(this, { log, debug, warn, error, defer })
    Object
      .keys(host)
      .forEach((task) => this.tasks[task] = host[task].bind(this))
    this.plugins = plugins
    plugins.forEach(_ => _.call(this))
  }
  /**
   * Begin a yieldable sequence. Initialize globs, filters and writers.
   * @param {...String} glob patterns
   * @return Fly instance. Promises resolve to { file, source }
   */
   source (...globs) {
     this._globs = flatten(globs)
     this._filters = []
     this._writers = []
     return this
   }
  /**
   * Add a filter. If name is undefined, extend the prototype with this[name].
   * @param
   *   {String} name of the filter
   *   {Object} { transform, options, ext } object
   *   {Function} transform function
   * @param [{Function}] transform function
   */
  filter (name, transform, { ext = "" } = {}) {
    if (name instanceof Function) {
      this.filter({ transform: name })
    } else if (typeof name === "object") {
      this._filters.push(name)
    } else {
      if (this[name] instanceof Function)
        throw new Error(`${name} method already defined in instance.`)
      this[name] = (options) => this.filter({ transform, options, ext })
    }
    return this
  }
  /**
  * Watch for IO events in globs and run tasks.
  * @param {[String]} glob patterns to observe for changes
  * @param {[String]} list of tasks to run on changes
  */
  watch (globs, tasks) {
    this.emit("fly_watch").start(tasks)
      .then(() => watch(flatten[globs], { ignoreInitial: true })
        .on("all", () => this.start(tasks)))
    return this
  }
  /**
  * Unwrap source globs.
  * @param {Function} onFulfilled
  * @param {onRejected} onFulfilled
  */
  unwrap (onFulfilled, onRejected) {
    return new Promise((resolve, reject) => {
      Promise.all(this._globs.map(glob => expand(glob)))
        .then((result) => resolve.apply(this, result)).catch(reject)
      }).then(onFulfilled).catch(onRejected)
  }
  /**
   * @private Execute a single task.
   * @param {String} name of the task
   * @param {Mixed} initial value to pass into the task
   * @param {Object} alternate Fly instance to bind the task with
   */
  *exec (task, value, inject = this) {
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
   * Run tasks. Each task's return value cascades on to the next task in
   * a series. Can be yielded inside a task.
   * @param {Array} list of tasks to run
   * @return {Promise}
   */
  start (tasks = "default", { parallel = false, value } = {}) {
    return co.call(this, function* (tasks) {
      if (parallel) {
        yield tasks.map((task) =>
          this.exec(task, value, Object.create(this)))
      }
      else {
        for (const task of tasks)
          value = yield this.exec(task, value)
      }
    }, [].concat(tasks).filter((task) =>
        ~Object
          .keys(this.host)
          .indexOf(task) || !this.emit("task_not_found", { task })))
  }
  /**
   * Add a writer function to the collection of writers.
   * @param {Generator} function yielding a promise
   */
  write (writer) {
    this._writers.push(writer.bind(this))
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
   * Concat read globs into one or more files.
   * @param {[String]} array of name of target files
   */
  concat (name) {
    this.write(function* ({ path, source }) {
      // @TODO: by default this operation should clear the target file to concat
      mkdirp.sync(path)
      yield appendFile(join(path, name), source, ENCODING)
    })
    return this
  }
  /**
   * Resolve a yieldable sequence. Reduce source applying available filters.
   * @param {Array} destination paths
   */
  target (...dest) {
    if (this._writers.length === 0) {
      this.write(function* ({ target, source }) {
        mkdirp.sync(dirname(target))
        yield writeFile(target, source, ENCODING)
      })
    }
    return co.call(this, function* () {
      for (const glob of this._globs) {
        for (const file of yield expand(glob)) {
          const output = yield function* reduce (file, filters) {
            const filter = filters[0]
            return filters.length === 0
              ? file : yield reduce.call(this, {
                source: yield Promise.resolve(filter.transform
                  .call(this, file.source, filter.options)),
                ext: filter.ext
                ? filter.ext : file.ext
              }, filters.slice(1))
          }.call(this, {
            source: `${yield readFile(file)}`,
            ext: parse(file).ext
          }, this._filters)

          for (const path of flatten(dest)) {
            for (const write of this._writers) {
              yield write({
                path, source: output.source,
                target: join(path, `${parse(file).name}${output.ext}`)
              })
            }
          }
        }
      }
    })
  }
}
