'use strict';

const src = 'lib/**/*.js';

exports.default = function * () {
	/** @desc Fly's default development task. */
	yield this.source(src).xo();
	yield this.source(src).target('tmp');
	yield this.clear('tmp');
};
