module.exports.default = function * () {
	yield this.source('*.js').eslint()
}
