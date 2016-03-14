var x = module.exports

x.default = function * () {
	yield this.clear('dist')
	yield this.start(['first', 'second', 'third'], {parallel: true})
}

x.first = function * () {
	yield this
		.source('src/*.1')
		.filter(function (s) {
			return this.defer(transform)(s, {time: 500})
		}).bind(this)
		.concat('all.1.min')
		.target('dist')
}

x.second = function * () {
	yield this
		.source('src/*.2')
		.filter(function (s) {
			return this.defer(transform)(s, {time: 500})
		}).bind(this)
		.concat('all.2.min')
		.target('dist')
}

x.third = function * () {
	yield this
		.source('src/*.3')
		.filter(function (s) {
			return this.defer(transform)(s, {time: 500})
		}).bind(this)
		.concat('all.3.min')
		.target('dist')
}

function transform (data, options, cb) {
	// Add a delay to simulate a lengthy transform.
	setTimeout(function () {
		return cb(null, data.toString())
	}, options.time)
}
