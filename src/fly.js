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
    @param {Object} host Flyfile
    @param {String} root Relative base path / root.
    @param {Array} plugins List of plugins to load.
    @desc Create a new instance of Fly. Use fly.start(...) to run tasks.
   */
  constructor ({ host, root = "./", plugins = [] }) {
    super()
    this.encoding = process.env.ENCODING
    this.host = this.tasks = {}
    this.defer = _.defer
    Object.keys(host).forEach((task) =>
      this.tasks[task] = this.host[task] = host[task].bind(this))
    process.chdir(this.root = root)
    plugins.forEach((plugin) => plugin.call(this))
  }
  /**
    @desc Log a message with a time stamp as defined in fly-fmt.
   */
  log (...args) {
    _.log(`[${fmt.time}] ${args}`)
    return this
  }
  /**
    @desc Reset the internal state.
   */
  reset () {
    this._src = []
    this._filters = []
    this._writers = []
    return this
  }
  /**
    @param {...String} paths
    @desc Clear each specified directory. Wraps rimraf.
   */
  clear (...paths) {
    const _clear = this.defer(rimraf)
    return paths.map((path) => _clear(path))
  }
  /**
    @param {String} name File name to concatenate unwrapped sources.
    @desc Concatenates files read via source.
    @todo: clear files before appending to them.
   */
  concat (name) {
    this._writers.push(({ dest, data }) => {
      mkdirp.sync(dest)
      return fs.appendFile(join(dest, name), data, this.encoding)
    })
    return this
  }
  /**
    @param {...Function} filters
    @desc Add a filter to be applied when unwrapping the source promises.
   */
  filter (...filters) {
    filters.forEach((filter) => this._filters.push(filter))
    return this
  }
  /**
    @param {Array} globs Glob pattern to watch for changes.
    @param {...String} tasks List of tasks to apply.
    @desc Run the specified tasks when a change is detected in the globs.
   */
  watch (globs, ...tasks) {
    _.watch(globs, ...tasks).on("change", () => this.start(tasks))
    return this
  }
  /**
    @param {Array} tasks List of tasks to run
    @desc Runs the specified tasks.
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
    @param {...String} globs Glob pattern
    @desc expand resolves to an array of file names from the glob pattern.
    Each file is mapped to a read file promise that resolves in a recursive
    filter returning { file, data }
  */
  source (...globs) {
    globs.forEach((pattern) => {
      const base = ((base) => {
        return base.length > 1
          ? base.shift()
          : ""
      }(pattern.split("*")))
      this.reset()._src.push(_.expand(pattern, (files) => {
        return files.map((file) => {
          return fs.readFile(file, this.encoding)
            .then((data) => (function filter (data, filters) {
              return (filters.length > 0)
                ? filter(filters[0].call(this, data), filters.slice(1))
                : { file, data, base }
            }.call(this, `${data}`, this._filters)))
        })
      }))
    })
    return this
  }
  /**
    @param {Array:Promise} source
    @desc Resolves an array of promises an return a new promise with the result.
   */
  unwrap (source = this._src) {
    return new Promise((resolve) => {
      Promise.all(source).then((result) => resolve.apply(this, result))
    })
  }
  /**
    @param {...String} dest Destination paths
    @desc Resolves all source promises and writes to each destination path.
   */
  target (...dest) {
    return Promise.all(dest.map((dest) => {
      return this.unwrap(this._src).then((files) => {
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
