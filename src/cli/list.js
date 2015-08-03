import fmt from "../fmt"
/**
  List tasks in a fly instance.
  @param {Object} fly instance
  @param {{ bare:Boolean }} unstyled
 */
export function list (host, { bare }) {
  if (!bare) console.log(`\n${fmt.dim.bold("Available tasks")}`)
  each(host instanceof Function
    ? Object.assign(host, { default: host })
    : host, (task, desc) =>
      console.log(`${bare ? "%s" : "  " + fmt.title + "\t" + desc}`, task))
  if (!bare) console.log()
}
/**
  Run handler for each task and description field in host.
 */
function each (host, handler) {
  Object.keys(host).forEach((task) => {
    const desc = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec(`${host[task]}`)
    handler(task, desc ? desc.pop() : "")
  })
}
