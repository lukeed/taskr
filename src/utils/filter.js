import debug from "debug"
import { flatten } from "./flatten"
const _ = debug("fly:filter")

/**
  Filter fly-* plugins from a package dependencies.
  @param {Object} package.json
  @param {Function} load handler
  @param {[String]} blacklisted plugins
  @return {[String]} list of fly plugins
*/

export function filter (pkg, load, blacklist = []) {
  _("filter fly-* plugins")
  return !pkg ? []
    : flatten(["dependencies", "devDependencies", "peerDependencies"]
      .filter((key) => key in pkg)
      .map((dep) => Object.keys(pkg[dep])))
      .filter((dep) => /^fly-[-\w]+/g.test(dep))
      .filter((dep) => !~["fly-util"].concat(blacklist).indexOf(dep))
      .reduce((prev, next) => prev.concat(load(next)), [])
}
