'use strict';

const p = require('path');
const JSZip = require('jszip');

module.exports = function (task, utils) {
	const zip = new JSZip();

	task.plugin('zip', { every:false }, function * (files, opts) {
		opts = Object.assign({ file:'archive.zip' }, opts);

		let curr;
		for (const file of files) {
			if (file.data) {
				curr = p.relative(task.root, p.format(file));
				zip.file(curr, file.data, { base64:true });
			}
		}

		const outdata = yield zip.generateAsync({ type:'nodebuffer' });

		// if an alt `dest` was given
		if (opts.dest !== void 0) {
			// write file without overwriting files
			const outfile = p.resolve(task.root, opts.dest, opts.file);
			yield utils.write(outfile, outdata);
		} else {
			// overwrite with the archive
			this._.files = [{
				dir: files[0].dir,
				base: opts.file,
				data: outdata
			}];
		}
	});
};
