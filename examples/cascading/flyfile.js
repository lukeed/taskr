var x = module.exports

x.first = function * () {
	return {secret: 42}
}

x.second = function * (obj) {
	return {secret: obj.secret}
}

x.third = function * (obj) {
	this.log('The secret is ' + obj.secret)
}

x.default = function * () {
	yield this.start(['first', 'second', 'third'])
}
