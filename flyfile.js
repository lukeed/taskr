var x = module.exports;
var paths = {
	src: 'lib/**/*.js',
	dist: 'dist'
};

x.default = function * () {
	/** @desc The default task. */
	// yield this.source(paths.src).xo();
	yield this.clear(paths.dist);
	yield this.log('Building Fly...')
		.source(paths.src)
		// .babel({
		// 	presets: ['es2015', 'stage-0']
		// })
		.target(paths.dist);
};
