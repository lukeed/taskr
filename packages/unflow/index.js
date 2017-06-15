'use strict';

const clean = require('flow-remove-types');

module.exports = function (task) {
	task.plugin('unflow', { every:false }, function * (files, opts) {
		opts = Object.assign({ pretty:true, all:true }, opts);

		const type = opts.sourceMap || false;
		const maps = [];

		files.forEach(file => {
			const out = clean(file.data.toString(), opts);
			file.data = Buffer.from(out.toString());

			const mdata = Buffer.from(type ? JSON.stringify(out.generateMap()) : '');

			// handle sourcemaps
			if (type === 'inline') {
				file.data += Buffer.from(`\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${mdata.toString('base64')}`);
			} else if (type === 'external') {
				const mfile = `${file.base}.map`;
				file.data += Buffer.from(`\n//# sourceMappingURL=${mfile}`);
				// push an external sourcemap to output
				maps.push({
					dir: file.dir,
					base: mfile,
					data: mdata
				});
			}
		});

		if (maps.length > 0) {
			this._.files = this._.files.concat(maps);
		}
	});
};
