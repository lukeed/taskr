"use strict"

const fmt = require("./fmt")
const $ = require("./utils/logging")
const formatTime = require("./fn").formatTime

module.exports = function () {
	return this
		.on("fly_run", file => {
			$.log(`Flying with ${fmt.path(file)}`)
		})

		.on("flyfile_not_found", () => {
			$.log("Flyfile not found!")
			process.exit(1)
		})

		.on("fly_watch", () => {
			$.log(`${fmt.warn("Watching files...")}`)
		})

		.on("fly_watch_event", obj => {
			$.log(`File ${obj.action}: ${fmt.warn(obj.file)}`)
		})

		.on("globs_no_match", (globs, opts) => {
			let str = `${fmt.warn("Warning:")} Source did not match any files!`
			str += `\n\t  Patterns:   ${JSON.stringify(globs)}`
			opts && (str += `\n\t  Options:    ${JSON.stringify(opts)}`)
			$.log(str)
		})

		.on("plugin_load", obj => {
			$.log(`Loading plugin ${fmt.title(obj.plugin)}`)
		})

		.on("plugin_load_error", str => {
			$.log(`Problem loading plugin: ${fmt.title(str)}`)
		})

		.on("plugin_rename", (old, nxt) => {
			$.log(`${fmt.title(old)} was renamed to ${fmt.title(nxt)} because its name was taken`)
		})

		.on("plugin_warning", obj => {
			$.log(`${fmt.warn(obj.plugin)} warned that ${fmt.warn(obj.warning)}`)
		})

		.on("plugin_error", obj => {
			process.exitCode = 1
			$.log(`${fmt.error(obj.plugin)} failed because ${fmt.error(obj.error)}`)
		})

		.on("tasks_force_object", () => {
			$.error("Invalid Tasks!")
			$.log("Custom `tasks` must be an `object`.")
			process.exit(1)
		})

		.on("task_error", (name, msg) => {
			$.log(`${fmt.error(name)} failed because ${fmt.error(msg)}`)
		})

		.on("task_start", str => {
			$.log(`Starting ${fmt.title(str)}`)
		})

		.on("task_complete", (str, time) => {
			const t = formatTime(time)
			$.log(`Finished ${fmt.complete(str)} in ${fmt.time(t)}`)
		})

		.on("task_not_found", str => {
			$.log(`${fmt.error(str)} not found in Flyfile.`)
			process.exit(1)
		})

		.on("serial_error", () => {
			process.exitCode = 1
			$.error("Task chain was aborted!")
		})
}
