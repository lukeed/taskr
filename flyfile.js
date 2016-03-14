'use strict'

var src = 'lib/**/*.js'

module.exports.default = function * () {
	/** @desc Fly's default development task. */
	yield this.source(src).xo()
	yield this
		.log('Building Fly...')
		.source(src).target('tmp')
	yield this.clear('tmp')
}
