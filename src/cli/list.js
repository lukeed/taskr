import fmt from "../fmt"
import { log } from "../util"

/**
  @desc List all tasks available in the flyfile
  @param {Object} flyfile
  @param {Object} opts.simple Simple task listing.
  */
export default function (flyfile, { simple }) {
  const host = require(flyfile)
  if (!simple) log(`\n${fmt.dim.bold("Available tasks")}`)
  Object.keys(host).forEach((key) => {
    const match = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec(`${host[key]}`)
    log(`${simple ? "%s" : fmt.title + "\t"} ${match ? match[0] : ""}`, key)
  })
  if (!simple) log()
}
