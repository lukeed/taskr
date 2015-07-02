import glob from "glob"
import { join } from "path"
import fs from "mz/fs"
import chokidar from "chokidar"
import updateNotifier from "update-notifier"

/** Object.assign wrapper for fly clients */
export const assign = Object.assign

/** console.log wrapper */
export function log (...args) {
  console.log.apply(console, args)
}

/** console.error wrapper */
export function error (...args) {
  console.error.apply(console, args)
}

/** Promisify an async function. */
export function defer (asyncFunc) {
  return (...args) => new Promise((resolve, reject) =>
    asyncFunc.apply(this, args.concat((err, ...args) =>
      err ? reject(err) : resolve(args))))
}

/**
  Resolve a path to file or file/name is file is a directory.
 */
export function *resolve ({ file, name }) {
  const root = join(process.cwd(), file)
  return (yield fs.stat(file))
    .isDirectory() ? join(root, name) : root
}

/**
  Load `fly-*` plugins from a package.json deps.
  @param {Package} opts.pkg
  @param {Array} opts.deps
  @param {Array} opts.blacklist
  @return {Array} List of fly deps that can be loaded.
 */
export function plugins ({ pkg, deps, blacklist = []}) {
  if (pkg) {
    deps = ["dependencies", "devDependencies", "peerDependencies"]
      .filter((key) => key in pkg)
      .reduce((p, c) => [].concat(Object.keys(pkg[p]), Object.keys(pkg[c])))
  }
  return deps
    .filter((dep) => /^fly-.+/g.test(dep))
    .filter((dep) => !~blacklist.indexOf(dep))
    .reduce((prev, curr) => [].concat(prev, curr), [])
}

/**
  Expand a glob pattern and runs a handler for each expanded glob.
  @param pattern {String} Pattern to be matched
  @param handler {Function} Function to run for each unwrapped glob promise.
  @return {Promise}
 */
export function expand (pattern, handler) {
  return new Promise((resolve, reject) => {
    glob(pattern, {/* TODO */}, (error, files) =>
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
export function watch (globs) {
  return chokidar.watch(
    (function flatten (arr) {
      return arr.reduce((flat, next) =>
        flat.concat(Array.isArray(next) ? flatten(next) : next), [])
    }([globs])))
}

/** Wrapper for update-notifier */
export function notifyUpdates (options) {
  updateNotifier(options).notify()
}
