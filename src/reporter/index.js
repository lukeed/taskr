import fmt from "../fmt"
import timeInfo from "./timeInfo"
import { log, trace } from "fly-util"

export default function () {
  return this
  .on("fly_run", ({ path }) =>
    log(`Flying with ${fmt.path}...`, path))

  .on("flyfile_not_found", ({ error }) =>
    log(`No Flyfile Error: ${fmt.error}`, error))

  .on("fly_watch", () =>
    log(`${fmt.warn}`, "Watching files..."))

  .on("plugin_load", ({ plugin }) =>
    log(`Loading plugin ${fmt.title}`, plugin))

  .on("plugin_error", ({ plugin, error }) =>
    log(`${fmt.error} failed due to ${fmt.error}`, plugin, error))

  .on("task_error", ({ task, error }) => {
    trace(error)
    log(`${fmt.error} failed due to ${fmt.error}`, task, error)
  })

  .on("task_start", ({ task }) =>
    log(`Starting ${fmt.start}`, task))

  .on("task_complete", ({ task, duration }) => {
    const time = timeInfo(duration)
    log(`Finished ${fmt.complete} in ${fmt.secs}`,
      task, time.duration, time.scale)
  })

  .on("task_not_found", ({ task }) =>
    log(`${fmt.error} not found in Flyfile.`, task))
}
