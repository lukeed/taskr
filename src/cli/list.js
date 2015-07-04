import fmt from "../fmt"
import { log } from "../util"

/**
  List all tasks available in the flyfile
  @param {Object} flyfile
  @param {Object} opts.simple Simple task listing.
  */
export default function (flyfile, { simple }) {
  const host = require(flyfile)
  if (!simple) log(`\n${fmt.dim.bold("Available tasks")}`)
  Object.keys(host).forEach((key) => {
    const match = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec(`${host[key]}`)
    const description = match ? match.pop() : ""
    log(`${simple ? "%s" : "  " + fmt.title + "\t" + description}`, key)
  })
  if (!simple) log()
}
