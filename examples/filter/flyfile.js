module.exports.default = function * () {
	yield this.clear('dist')

	yield this
		.source('text')
		.filter(function (data) {
			return data.toString().replace(/(\w+)\s(\w+)/g, '$2 $1')
		})
		.target('dist/swap')
}
