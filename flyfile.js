var x = module.exports;
var paths = {
	src: 'lib/**/*.js',
	dist: 'dist'
};

x.default = function * () {
	/** @desc Fly's default development task. */
	yield this.source(paths.src).xo();
	yield this.clear(paths.dist);
	yield this
		.log('Building Fly...')
		.source(paths.src)
		.target(paths.dist);
};
