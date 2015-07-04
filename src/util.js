import fs from "mz/fs"
import fmt from "./fmt"
import glob from "glob"
import pretty from "prettyjson"
import chokidar from "chokidar"
import { join } from "path"
import { jsVariants } from "interpret"
import updateNotifier from "update-notifier"

/** console.log wrapper */
export function log (...args) {
  console.log.apply(console, args)
}

/** console.error wrapper */
export function error (...args) {
  console.error.apply(console, args)
}

/**
  Pretty print error.
  @param {Object}
 */
export function trace (error) {
  error(pretty.render(error)
    .replace(/(\sFunction|\sObject)\./g, `${fmt.blue("$1")}.`)
    .replace(/\((~?\/.*)\)/g, `(${fmt.gray("$1")})`)
    .replace(/:([0-9]*):([0-9]*)/g, ` ${fmt.yellow("$1")}:${fmt.yellow("$2")}`)
    .replace(new RegExp(process.env.HOME, "g"), "~")
  )
}

/**
  Promisify an async function.
  @param {Function} async function to promisify
  @return {Function} function that returns a promise
 */
export function defer (asyncFunc) {
  return (...args) => new Promise((resolve, reject) =>
    asyncFunc.apply(this, args.concat((err, ...args) =>
      err ? reject(err) : resolve(args))))
}

/**
  Resolve the Flyfile path. Check the file extension and attempt to load
  every possible JavaScript variant if `file` is a directory.
  @param {String} file or path to the Flyfile
  @param [{String}] Flyfile variant name
  @return {String} path to the Flyfile
 */
export function* find ({ file, names = ["Flyfile", "Flypath"] }) {
  const root = join(process.cwd(), file)
  return hook(require, (yield fs.stat(file)).isDirectory()
    ? yield resolve(match(
        names.concat(names.map((name) => name.toLowerCase()))
          .map((name) => join(root, name)),
        Object.keys(jsVariants)
      ))
    : root)

  /**
    Add require hook so that subsequent calls to require transform the
    JavaScript source variant (ES7, CoffeeScript, etc.) in the fly.
    @param {Function} require function to load selected module
    @param {String} path to Flyfile
    @return {String} path to Flyfile
    @private
   */
   function hook (require, path) {
     const js = jsVariants[`.${path.split(".").slice(1).join(".") || "js"}`]
     if (Array.isArray(js)) {
       (function reduce (modules) {
         if (modules.length === 0) return
         try { require(modules[0]) }
         catch (_) { reduce(modules.slice(1)) }
       }(js))
     } else if (js) { require(js.module) }
     return path
   }

  /**
    Resolve to the first existing file in paths.
    @param {Array:String} list of paths to search
    @return {String} path of an existing file
    @private
   */
  function* resolve (paths) {
    if (paths.length === 0) throw { code: "ENOENT" }
    try {
      if (yield fs.stat(paths[0])) return paths[0]
    } catch (e) { return yield resolve(paths.slice(1)) }
  }

  /**
    Match files and extensions.
    @param {Array:String} List of files to match
    @param {Array:String} List of extensions to match
    @return {Array} Product of matched files * extensions
    @private
   */
  function match (files, exts) {
    return files.length === 1
      ? exts.map((ext) => `${files[0]}${ext}`)
      : match([files[0]], exts).concat(match(files.slice(1), exts))
  }
}

/**
  Flattens a nested array recursively.
  @return [[a],[b],[c]] -> [a,b,c]
 */
export function flatten (array) {
  return array.reduce((flat, next) =>
    flat.concat(Array.isArray(next) ? flatten(next) : next), [])
}

/**
  Search `fly-*` plugins listed in package.json dependencies.
  @param {Package} project's package.json
  @param {Array} blacklisted plugins
  @return {Array} list of loadable fly deps
 */
export function searchPlugins ({ pkg, blacklist = []}) {
  if (!pkg) return []
  return flatten(["dependencies", "devDependencies", "peerDependencies"]
    .filter((key) => key in pkg)
    .map((dep) => Object.keys(pkg[dep])))
    .filter((dep) => /^fly-.+/g.test(dep))
    .filter((dep) => !~blacklist.indexOf(dep))
}

/**
  Expand a glob pattern and runs a handler for each expanded glob.
  @param pattern {String} Pattern to be matched
  @param handler {Function} Function to run for each unwrapped glob promise.
  @return {Promise}
 */
export function expand (pattern, handler) {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, (error, files) =>
      error
        ? reject(error)
        : Promise.all(handler(files)).then((files) =>
          resolve(files)).catch((error) => { throw error }))
  })
}

/**
  Wrapper for chokidar.watch. Array of globs are flattened.
  @param {Array:String} globs
  @param {...String} tasks Tasks to run
  @return {chokidar.FSWatcher}
 */
export function watch (globs, opts) {
  return chokidar.watch(flatten([globs]), opts)
}

/**
  Wrapper for update-notifier.
  @param {Array} options
 */
export function notifyUpdates (options) {
  updateNotifier(options).notify()
}
