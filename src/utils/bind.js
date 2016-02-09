import debug from "debug"
import { jsVariants as js } from "interpret"
const _ = debug("fly:bind")

/**
  Register bind to node require to support on the fly compilation.
  Bind require to babel to support ES6 by default.
  @param {String} path to a flyfile
  @param {Options} options to function modules, e.g, babel
  @return {String} path
*/
export function bind (path, options) {
  const module = reduce(
    js[`.${(path || "").split(".").slice(1).join(".")}`] || js[".babel.js"]
  )
  if (module instanceof Function) {
    module(options || { stage: 0 })
  }
  return path
}
/**
  Try require each module until we don't error.
  @param {String} module name
*/
function reduce (m) {
  if (Array.isArray(m)) {
    try {
      const module = m[0].module ? m[0].module : m[0]
      _("register bind %o", module)
      return require(module)
    } catch (_) { return reduce(m.slice(1)) }
  } else return reduce([m])
}
