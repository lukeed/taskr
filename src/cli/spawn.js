import Fly from "../fly"
import { searchPlugins as search, error } from "fly-util"
import path from "path"

/**
  Resolve flyfile using flypath and create a new Fly instance.
  @param {String} flypath Path to a flyfile
 */
export default function* (flypath) {
  const host = require(flypath)
  const root = path.dirname(flypath)
  const load = (...file) => require(path.join(root, ...file))
  const plugins = () => {
    try {
      return search(load("package")).reduce((prev, next) =>
        prev.concat(load("node_modules", next)), [])
    } catch (e) { error(`${e}`) }
  }()
  return new Fly({ host, root, plugins })
}
