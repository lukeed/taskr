import fmt from "./fmt"
import { log } from "fly-util"

export default function () {
  this.on("fly_run", ({ path }) =>
    log(`[${fmt.time}] Flying with ${fmt.path}...`, path))

  .on("flyfile_not_found", ({ error }) =>
    log(`No Flyfile Error: ${fmt.error}`, error))

  .on("fly_watch", () =>
    log(`[${fmt.time}] ${fmt.warn}`, "Watching files..."))

  .on("plugin_load", ({ plugin }) =>
    log(`[${fmt.time}] Loading plugin ${fmt.name}`, plugin))

  .on("plugin_error", ({ plugin, error }) =>
    log(`[${fmt.time}] ${fmt.error} failed due to ${fmt.error}`, plugin, error))

  .on("task_error", ({ task, error }) =>
    log(`[${fmt.time}] ${fmt.error} failed due to ${fmt.error}`, task, error))

  .on("task_start", ({ task }) =>
    log(`[${fmt.time}] Starting ${fmt.start}`, task))

  .on("task_complete", ({ task, duration }) =>
    log(`[${fmt.time}] Finished ${fmt.complete} in ${fmt.secs}`,
      task, duration, "ms"))

  .on("task_not_found", ({ task }) =>
    log(`[${fmt.time}] ${fmt.error} not found in Flyfile.`, task))

  return this
}
