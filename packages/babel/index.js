'use strict';

const transform = require('babel-core').transform;
const readPkg = require('read-pkg-up');
const flatten = require('flatten');

const BABEL_REGEX = /(^babel-)(preset|plugin)-(.*)/i;

function getBabels() {
	const pkg = readPkg.sync().pkg;
	return flatten(
		['devDependencies', 'dependencies'].map(s => Object.keys(pkg[s] || {}))
	).filter(s => BABEL_REGEX.test(s));
}

module.exports = function (task) {
	let cache;

	task.plugin('babel', {}, function * (file, opts) {
		if (opts.preload) {
			delete opts.preload;
			// get dependencies
			cache = cache || getBabels();

			// attach any deps to babel's `opts`
			cache.forEach(dep => {
				const segs = BABEL_REGEX.exec(dep);
				const type = `${segs[2]}s`;
				const name = segs[3];

				opts[type] = opts[type] || [];

				// flatten all (advanced entries are arrays)
				if (flatten(opts[type]).indexOf(name) === -1) {
					opts[type] = opts[type].concat(name);
				}
			});
		}

		// attach file's name
		opts.filename = file.base;

		const output = transform(file.data, opts);

		if (output.map) {
			const map = `${file.base}.map`;

			// append `sourceMappingURL` to original file
			if (opts.sourceMaps !== 'both') {
				output.code += new Buffer(`\n//# sourceMappingURL=${map}`);
			}

			// add sourcemap to `files` array
			this._.files.push({
				base: map,
				dir: file.dir,
				data: new Buffer(JSON.stringify(output.map))
			});
		}

		// update file's data
		file.data = new Buffer(output.code);
	});
};
