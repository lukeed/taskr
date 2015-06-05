import glob from "glob"
import { join } from "path"
import fs from "mz/fs"
import chokidar from "chokidar"
import updateNotifier from "update-notifier"

/** @desc Object.assign wrapper for fly clients */
export const assign = Object.assign

/** @desc console.log wrapper */
export function log (...args) {
  console.log.apply(console, args)
}

/** @desc console.error wrapper */
export function error (...args) {
  console.error.apply(console, args)
}

/** @desc Promisify an async function. */
export function defer (asyncFunc) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      const cb = (err, ...args) => err ? reject(err) : resolve(args)
      return asyncFunc.apply(this, args.concat(cb))
    })
  }
}

/** @desc If file is a directory resolve to cwd/name, cwd/file otherwise. */
export function *resolve ({ file, name }) {
  const root = join(process.cwd(), file)
  return (yield fs.stat(file)).isDirectory()
    ? join(root, name)
    : root
}

/**
  @desc Load fly-plugins from a package.json deps
  @param {Package} opts.pkg
  @param {Array} opts.deps
  @param {Array} opts.blacklist
  @return {Array} List of fly deps that can be loaded.
 */
export function plugins ({ pkg, deps, blacklist = []}) {
  if (pkg) {
    deps = ["dependencies", "devDependencies", "peerDependencies"]
      .filter((key) => key in pkg)
      .reduce((p, c) => [].concat(
        Object.keys(pkg[p]),
        Object.keys(pkg[c])))
  }
  return deps
    .filter((dep) => /^fly-.+/g.test(dep))
    .filter((dep) => !~blacklist.indexOf(dep))
    .reduce((prev, curr) => [].concat(prev, curr))
}

/**
  @desc Return a promise that unwraps to an expanded glob pattern
  @param pattern {String} Pattern to be matched
  @param handler {Function} Function to run for each unwrapped glob promise.
  @return {Promise}
 */
export function expand (pattern, handler) {
  return new Promise((resolve, reject) => {
    glob(pattern, {}, (e, files) => {
      if (e) {
        reject(e)
      } else {
        Promise.all(handler(files)).then((files) =>
          resolve(files)).catch((e) => { throw e })
      }
    })
  })
}

/** @desc Wrapper for a glob watcher on "change" event */
export function watch (globs, ...tasks) {
  return chokidar.watch(
    (function flatten (arr) {
      return arr.reduce((flat, next) =>
        flat.concat(Array.isArray(next) ? flatten(next) : next), [])
    }([globs])))
}

/** @desc Wrapper for update-notifier notify */
export function notifyUpdates (options) {
  updateNotifier(options).notify()
}
