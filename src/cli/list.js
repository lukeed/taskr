import fmt from "../fmt"
const log = console.log.bind(console)
/**
  List all tasks available in the flyfile
  @param {Object} flyfile
  @param {Object} opts.simple Simple task listing.
 */
export function list (flyfile, { simple }) {
  const host = require(flyfile)
  if (!simple) log(`\n${fmt.dim.bold("Available tasks")}`)

  each(host instanceof Function
    ? Object.assign(host, { default: host })
    : host, (key, value) => {
    const match = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec(`${value}`)
    const description = match ? match.pop() : ""
    log(`${simple ? "%s" : "  " + fmt.title + "\t" + description}`, key)
  })

  if (!simple) log()
}

function each (host, cb) {
  Object.keys(host).forEach((key) => cb(key, host[key]))
}
