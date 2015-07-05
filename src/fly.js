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
    @param {Object} Flyfile, also known as host
    @param {String} relative base path / root
    @param {Array} list of plugins to load.
   */
  constructor ({ host, root = "./", plugins = [] }) {
    super()
    this.defer = _.defer
    this.encoding = process.env.ENCODING
    this.host = this.tasks = host instanceof Function
      ? Object.assign(host, { default: host }) : host

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
    @param {String} name of the concatenated file
    @TODO: by default this operation should clear the target file to concat
   */
  concat (name) {
    this._writers.push(({ dest, data }) => {
      mkdirp.sync(dest)
      fs.appendFile(join(dest, name), data, this.encoding)
    })
    return this
  }
  /**
    Add a filter to be applied when unwrapping the source promises.
    @param {
      {String} name of the filter.
      {Object} { filter, options } object.
      {Function} filter function.
    }
    @param [{Function}] filter function.
   */
  filter (name, filter) {
    if (name instanceof Function) {
      this.filter({ filter: name })
    } else if (typeof name === "object") {
      this._filters.push(name)
    } else {
      if (this[name] instanceof Function)
        throw new Error(`${name} method already defined in instance.`)
      this[name] = (options) => this.filter({ filter, options })
    }
    return this
  }
  /**
    Watch for changes on globs and run each of the specified tasks.
    @param {Array:String} glob patterns to observe for changes
    @param {Array:String} list of tasks to run on changes
   */
  watch (globs, tasks) {
    this.notify("fly_watch").start(tasks)
    _.watch(globs, { ignoreInitial: true }).on("all", () => this.start(tasks))
    return this
  }
  /**
    Runs the specified tasks.
    @param {Array} list of tasks to run
   */
  start (tasks = []) {
    if (tasks.length === 0) tasks.push(this.host.default ? "default" : "main")
    co.call(this, function* () {
      for (let task of [].concat(tasks)
        .filter((task) => {
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
    return this
  }
  /**
    Creates an array of promises with read sources from a list of globs.
    When a promise resolved, the data source is reduced applying each of
    the existing filters.
    @param {...String} glob patterns
    @return Fly instance. Promises resolve to { file, data }
  */
  source (...globs) {
    this._source = []
    this._filters = []
    this._writers = []

    _.flatten(globs).forEach((pattern) => {
      const base = ((base) => {
        return base.length > 1 ? base.shift() : ""
      }(pattern.split("*")))

      this._source.push(_.expand(pattern, (files) => {
        return files.map((file) => {
          return fs.readFile(file, this.encoding)
            .then((data) => (function reduce (data, filters) {
              return (filters.length > 0)
                ? reduce(filters[0].filter
                  .apply(this, [data, filters[0].options]), filters.slice(1))
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
    @param {...String} destination paths
   */
  target (...dest) {
    return Promise.all(_.flatten(dest).map((dest) => {
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
