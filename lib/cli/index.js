"use strict"

module.exports = {
	help: require("./help"),
	list: require("./list"),
	options: require("./options"),
	spawn: require("./spawn"),
	version: pkg => console.log(`${pkg.name}, ${pkg.version}`)
}
