/** @overview Fly reporter */

import fmt from "./fmt"
import { log } from "./util"

/** @desc Bound to an emitter (fly) object observing triggered events */
export default function () {
  this.on("fly_start", () =>
    log(`[${fmt.time}] ${fmt.title}`, "Starting Fly..."))

  .on("flyfile_not_found", ({ error }) =>
    log(`No Flyfile Error: ${fmt.error}`, error))

  .on("plugin_load", ({ plugin }) =>
    log(`[${fmt.time}] Loading plugin ${fmt.plugin}`, plugin))

  .on("plugin_run", ({ plugin }) =>
    log(`[${fmt.time}] Running ${fmt.plugin}`, plugin))

  .on("plugin_error", ({ plugin, error }) =>
    log(`[${fmt.time}] ${fmt.plugin} failed due to ${fmt.error}`, plugin, error))

  .on("task_skip", ({ task }) =>
    log(`${fmt.error} is a function reserved by Fly.`, task))

  .on("task_start", ({ task }) =>
    log(`[${fmt.time}] Running ${fmt.task}`, task))

  .on("task_error", ({ task, error }) =>
    log(`[${fmt.time}] ${fmt.task} failed due to ${fmt.error}`, task, error))

  .on("task_complete", ({ task, duration }) =>
    log(`[${fmt.time}] Completed ${fmt.task} in ${fmt.secs}`,
      task, duration, "ms"))

  .on("task_not_found", ({ task }) =>
    log(`[${fmt.time}] ${fmt.error} not found in Flyfile.`, task))

  .on("file_created", ({ file }) =>
    log(`[${fmt.time}] File ${fmt.file} created.`, file))

  return this
}
