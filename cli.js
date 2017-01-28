#!/usr/bin/env node
"use strict"

const Promise = require("bluebird")
const reporter = require("./lib/reporter")
const utils = require("./lib/utils")
const cli = require("./lib/cli")
const pkg = require("./package")
const co = Promise.coroutine

co(function* () {
	// get command options
	const o = cli.options()
	const t = o._.length ? o._ : ["default"]

	if (o.help) {
		return cli.help()
	}

	if (o.version) {
		return cli.version(pkg)
	}

	const fly = yield cli.spawn(o.cwd)
	reporter.call(fly)

	if (!fly.file) {
		return fly.emit("flyfile_not_found")
	}

	if (o.list) {
		return cli.list(fly.tasks, o.list === "bare")
	}

	// announce start
	fly.emit("fly_run", fly.file)
	// run `tasks` in `mode`
	fly[o.mode](t)

})().catch(err => {
	if (err.type === "cli") {
		utils.error(`CLI Error! ${err.message}`)
	} else {
		console.error(utils.trace(err.stack))
	}
})
