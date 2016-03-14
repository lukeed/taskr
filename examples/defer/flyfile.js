function transform(data, options, cb) {
	setTimeout(function () {
		cb(null, data.toString().split('').reverse().join('').toUpperCase())
	}, options.time)
}

module.exports = function * () {
	var self = this

	yield this.clear('dist')
	yield this.source('src/*.txt')
		.filter(function (data) {
			return self.defer(transform)(data, {time: 1000})
		})
		.target('dist')
}
