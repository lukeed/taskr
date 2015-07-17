import path from "path"
import { findPlugins as find, warn } from "fly-util"

/**
  Resolve flyfile using flypath and create a new Fly instance.
  @param {String} flypath Path to a flyfile
 */
export function* spawn (flypath) {
  const host = require(flypath)
  const root = path.dirname(flypath)
  const load = (...file) => require(path.join(root, ...file))
  const plugins = yield function* () {
    try {
      return find(load("package"))
        .reduce((prev, next) => prev
          .concat(load("node_modules", next)), [])
    } catch (error) { warn(`${error.message}`) }
  }()
  return { host, root, plugins }
}
