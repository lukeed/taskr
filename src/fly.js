import co from "co"
import fs from "mz/fs"
import mkdirp from "mkdirp"
import rimraf from "rimraf"
import { dirname, join } from "path"
import Emitter from "./emitter"
import fmt from "./fmt"
import * as _ from "./util"

export default class Fly extends Emitter {
  /**
    Create a new instance of Fly. Use fly.start(...) to run tasks.
    @param {Object} host Flyfile
    @param {String} root Relative base path / root.
    @param {Array} plugins List of plugins to load.
   */
  constructor ({ host, root = "./", plugins = [] }) {
    super()
    this.defer = _.defer
    this.encoding = process.env.ENCODING
    this.host = this.tasks = {}
    Object.keys(host).forEach((task) =>
      this.tasks[task] = this.host[task] = host[task].bind(this))
    process.chdir(this.root = root)
    plugins.forEach((plugin) => plugin.call(this))
  }
  /**
    Log a message with a time stamp as defined in /fmt.
   */
  log (...args) {
    _.log(`[${fmt.time}] ${args}`)
    return this
  }
  /**
    Clear each specified directory. Wraps rimraf.
    @param {...String} paths
   */
  clear (...paths) {
    const _clear = this.defer(rimraf)
    return paths.map((path) => _clear(path))
  }
  /**
    Concatenates files read via source.
    @param {String} name File name to concatenate unwrapped sources.
    @todo: Append only to files that do not exist.
   */
  concat (name) {
    this._writers.push(({ dest, data }) => {
      mkdirp.sync(dest)
      return fs.appendFile(join(dest, name), data, this.encoding)
    })
    return this
  }
  /**
    Add a filter to be applied when unwrapping the source promises.
    @param {...Function} filters
   */
  filter (...filters) {
    filters.forEach((filter) => this._filters.push(filter))
    return this
  }
  /**
    Run the specified tasks when a change is detected in the globs.
    @param {Array} globs Glob pattern to watch for changes.
    @param {...String} tasks List of tasks to apply.
   */
  watch (globs, ...tasks) {
    ["change", "add", "unlink"].forEach((event) => {
      _.watch(globs).on(event, () => this.start(tasks))
    })
    return this
  }
  /**
    Runs the specified tasks.
    @param {Array} tasks List of tasks to run
   */
  start (tasks = []) {
    if (tasks.length === 0) tasks.push("default")
    co.call(this, function* () {
      for (let task of [].concat(tasks).filter((task) => {
          return ~Object.keys(this.host).indexOf(task)
          || !this.notify("task_not_found", { task })
      })) {
        const start = new Date()
        this.notify("task_start", { task })
        try {
          yield this.tasks[task].call(this)
          this.notify("task_complete", {
            task, duration: (new Date()).getTime() - start
          })
        } catch (error) {
          this.notify("task_error", { task, error })
        }
      }
    })
  }
  /**
    Creates an array of promises with read sources from a list of globs.
    When a promise resolved, the data source is reduced applying each of
    the existing filters.
    @param {...String} globs Glob pattern
    @return Fly instance. Promises resolve to { file, data }
  */
  source (...globs) {
    this._source = []
    this._filters = []
    this._writers = []

    globs.forEach((pattern) => {
      const base = ((base) => {
        return base.length > 1 ? base.shift() : ""
      }(pattern.split("*")))

      this._source.push(_.expand(pattern, (files) => {
        return files.map((file) => {
          return fs.readFile(file, this.encoding)
            .then((data) => (function reduce (data, filters) {
              return (filters.length > 0)
                ? reduce(filters[0].call(this, data), filters.slice(1))
                : { file, data, base }
            }.call(this, `${data}`, this._filters)))
        })
      }))
    })
    return this
  }
  /**
    Resolves an array of promises an return a new promise with the result.
    By default resolves the current promise sources.
    @param {Array:Promise} source
   */
  unwrap (source = this._source) {
    return new Promise((resolve) => {
      Promise.all(source).then((result) => resolve.apply(this, result))
    })
  }
  /**
    Resolves all source promises and writes to each destination path.
    @param {...String} dest Destination paths
   */
  target (...dest) {
    return Promise.all(dest.map((dest) => {
      return this.unwrap(this._source).then((files) => {
        return files.map(({ file, data, base }) => {
          return ((file) => {
            if (!this._writers.length) {
              mkdirp.sync(dirname(file))
              return fs.writeFile(file, data, this.encoding)
            }
            return this._writers.map((write) =>
              write({ dest, base, file, data }))
            }( join(dest, file.replace(base, "")) ))
        })
      })
    }))
  }
}
