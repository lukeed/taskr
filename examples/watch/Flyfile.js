var paths = {
	scripts: 'src/*.txt',
	dist: 'dist'
}

exports.default = function * () {
	yield this.watch(paths.scripts, 'move')
}

exports.move = function * () {
	yield this.clear(paths.dist)
	yield this
		.source(paths.scripts)
		.target(paths.dist)
}
