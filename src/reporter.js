import fmt from "./fmt"
import { log } from "fly-util"

export default function () {
  this.on("fly_run", ({ path }) =>
    log(`Flying with ${fmt.path}...`, path))

  .on("flyfile_not_found", ({ error }) =>
    log(`No Flyfile Error: ${fmt.error}`, error))

  .on("fly_watch", () =>
    log(`${fmt.warn}`, "Watching files..."))

  .on("plugin_load", ({ plugin }) =>
    log(`Loading plugin ${fmt.name}`, plugin))

  .on("plugin_error", ({ plugin, error }) =>
    log(`${fmt.error} failed due to ${fmt.error}`, plugin, error))

  .on("task_error", ({ task, error }) =>
    log(`${fmt.error} failed due to ${fmt.error}`, task, error))

  .on("task_start", ({ task }) =>
    log(`Starting ${fmt.start}`, task))

  .on("task_complete", ({ task, duration }) => {
    const time = timeInfo(duration)
    log(`Finished ${fmt.complete} in ${fmt.secs}`,
      task, time.duration, time.scale)
  })

  .on("task_not_found", ({ task }) =>
    log(`${fmt.error} not found in Flyfile.`, task))

  return this
}

/**
 * conditionally format task duration
 * @param  {Number} duration task duration in ms
 * @param  {String} scale default scale for output
 * @return {Object} time information
 */
function timeInfo (duration, scale = "ms") {
  return duration >= 1000
    ? { duration: Math.round((duration / 1000) * 10) / 10, scale: "s" }
    : { duration, scale }
}
