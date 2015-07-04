import Fly from "../fly"
import { plugins } from "../util"
import path from "path"

/**
  Resolve flyfile using flypath and create a new Fly instance.
  @param {String} flypath Path to a flyfile
  */
export default function* (flypath) {
  let root = path.dirname(flypath)
  let load = (...file) => require(path.join(root, ...file))
  let pkg = (pkg) => {
    try { return load(pkg) } catch (_) {}
  }("package")

  return new Fly({
    root,
    host: require(flypath),
    plugins: plugins({ pkg }).reduce((prev, next) =>
      prev.concat(load("node_modules", next)), [])
  })
}
