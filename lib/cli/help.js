"use strict"

const fmt = require("../fmt")

// @todo: do something better here...
module.exports = function () {
	const one = `${fmt.text.dim("$1")}`
	const two = `${fmt.text("$2")}`
	const str = `
Usage
  fly [options] [tasks]

Options
  -m  --mode=""   Run in "parallel" or "serial". Default: "serial"
  -d  --cwd=""    Set Fly's home directory. Default: "."
  -h  --help      Display this help message.
  -l  --list      Display available tasks.
  -v  --version   Display Fly version.

Examples
  fly -p="/demo"
  fly -m=parallel task1 task2
  fly --mode="serial"  task1 task2
	`

	return console.log(str
		.replace(/(\s--)(.*?)\s/g, `${one}${two}`)
		.replace(/(-)(.\s)/g, `${one}${two}`)
		.replace(/(^Options|^Usage|^Examples)/gm, one)
		.replace(/([_\/\\]|[_,])/gm, one)
	)
}
