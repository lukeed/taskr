"use strict"

const fmt = require("../fmt")
const rgx = /@desc(.*)/

/**
 * List available tasks within a Fly instance
 * @param {Object}  tasks  The available tasks
 * @param {Boolean} bare   Should output be unstyled?
 */
module.exports = function (tasks, bare) {
	bare = bare || false
	tasks = tasks || {}

	const out = [`\n${fmt.text.dim("Available tasks")}`]

	// parse tasks" descriptions, if any
	for (const k in tasks) {
		const arr = rgx.exec(tasks[k].toString())
		const txt = arr ? arr.pop().replace(/\*\//, "") : ""
		out.push(`\t${fmt.title(k)}\t${txt}`)
	}

	out.push("")

	if (bare) {
		out.shift()
		out.pop()
	}

	return console.log(out.join("\n"))
}
