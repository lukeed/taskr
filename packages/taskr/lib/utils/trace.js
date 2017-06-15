"use strict"

const extractPath = /\s+at.*(?:\(|\s)(.*)\)?/
const isPath = /^(?:(?:(?:node|(?:internal\/[\w/]*)?\w+)\.js:\d+:\d+)|native)/

module.exports = function (stack) {
	return stack.replace(/\\/g, "/")
		.split("\n")
		.filter(x => {
			const pathMatches = x.match(extractPath)

			if (pathMatches === null || !pathMatches[1]) {
				return true;
			}

			return !isPath.test(pathMatches[1])
		})
		.filter(x => x.trim() !== "")
		.join("\n")
}
