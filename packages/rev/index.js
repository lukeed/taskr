'use strict';

const p = require('path');
const revHash = require('rev-hash');
const sortKeys = require('sort-keys');

const SEP = '/';
let MANIFEST, FILEPATH;
const IGNORE = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.woff', '.ttf', '.eot', '.ico'];

function fixPath(str) {
	return str.replace(/\\+/g, SEP);
}

module.exports = function (task, utils) {
	/**
	 * Create new hashed file names based on contents
	 */
	task.plugin('rev', {}, function * (file, opts) {
		// overwrite default opt values
		opts = Object.assign({ ignores:IGNORE.concat('.html', '.json') }, opts);

		// bypass dirs or empty files
		if (!file.data) {
			return;
		}

		const ext = p.extname(file.base);
		// if this file's extension matches `ignores`, exit early
		if (!ext || opts.ignores.indexOf(ext) !== -1) {
			return;
		}

		file.orig = file.base;
		file.hash = revHash(file.data);

		// find first occurence of '.', NOT including first char
		const idx = file.base.indexOf('.', 1);

		// change filename; append hash to base name
		file.base = file.base.substr(0, idx).concat('-', file.hash, file.base.substr(idx));
	});

	/**
	 * Write the manifest file
	 */
	task.plugin('revManifest', { every:false }, function * (files, opts) {
		MANIFEST = {}; // reset

		opts = Object.assign({
			sort: true,
			dest: task.root, // place file
			trim: '', // path to trim
			file: 'rev-manifest.json'
		}, opts);

		// update known values
		FILEPATH = fixPath(p.resolve(opts.dest, opts.file));

		// content to replace
		if (!opts.trim || typeof opts.trim === 'string') {
			const t = opts.trim;
			// create `replace` function
			opts.trim = str => str.replace(new RegExp(t, 'i'), '/');
		}

		let dir, old;
		for (const f of files) {
			// only if was revv'd
			if (!f.orig) continue;
			// strip a string from the `file.dir` path
			dir = fixPath(p.relative(task.root, f.dir));
			// apply `opts.trim` func
			dir = fixPath(p.normalize(opts.trim(dir)));
			// ensure no leading '/'
			dir = dir.charAt(0) === '/' ? dir.substr(1) : dir;
			// reconstruct old path
			old = fixPath(p.join(dir, f.orig));
			// construct new; add pairing to manifest
			MANIFEST[old] = fixPath(p.join(dir, f.base));
		}

		// alphabetically sort
		if (opts.sort) {
			MANIFEST = sortKeys(MANIFEST);
		}

		// write the file
		yield utils.write(FILEPATH, JSON.stringify(MANIFEST, false, '	'));
	});

	/**
	 * Read all files within a `dir` & Update to latest filenames
	 */
	task.plugin('revReplace', { every:false }, function * (files, opts) {
		opts = Object.assign({ ignores:IGNORE }, opts);

		// get original manifest paths; escape safe characters
		const keys = Object.keys(MANIFEST).map(k => k.replace(/([[^$.|?*+(){}\\])/g, '\\$1')).join('|');
		const rgx = new RegExp(keys, 'gi');

		for (const f of files) {
			const ext = p.extname(f.base);
			// only if not in `ignores`
			if (!ext || opts.ignores.indexOf(ext) !== -1) continue;
			// replace orig with rev'd && write it
			const d = f.data.toString().replace(rgx, k => MANIFEST[k]);
			f.data = Buffer.from(d);
		}
	});
};
