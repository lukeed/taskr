module.exports.default = function * () {
	yield this.clear('dist')

	yield this
		.source('src/*.scss')
		.sass({
			outputStyle: 'compressed',
			includePaths: ['src/imports'],
			sourceMap: true
		})
		.target('dist')

	yield this
		.source('src/*.less')
		.less({compress: true, sourceMap: true})
		.target('dist')

	yield this
		.source('src/*.styl')
		.stylus({compress: true})
		.target('dist')
}
