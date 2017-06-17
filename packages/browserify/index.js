'use strict';

const p = require('path');
const browserify = require('browserify');

const NAME = '@taskr/browserify';
const toArr = val => Array.isArray(val) ? val : (val == null) ? [] : [val];

function setError(ctx, msg) {
	const error = msg.replace(ctx.root, '')
		.replace(': ', ': \n\n  ')
		.replace(' while parsing', '\n\nwhile parsing').concat('\n');

	ctx.emit('plugin_error', { plugin:NAME, error });
	return new Buffer(`console.error('${NAME}: Bundle error! Check CLI output.');`);
}

module.exports = function (task) {
	task.plugin('browserify', { every:false }, function * (files, opts) {
		opts = opts || {};

		if (opts.entries) {
			files = toArr(opts.entries).map(p.parse);
			delete opts.entries;
		}

		// init bundler
		const b = browserify();

		// apply transforms
		for (const t of opts.transform || []) {
			b.transform.apply(b, toArr(t));
		}

		delete opts.transform;

		const bundle = obj => new Promise((res, rej) => {
			b.add(p.format(obj), opts);
			b.bundle((err, buf) => err ? rej(err) : res(buf));
		});

		// @todo: check for source maps?
		for (const file of files) {
			try {
				file.data = yield bundle(file);
			} catch (err) {
				file.data = setError(task, err.message);
			}

			b.reset();
		}

		// replace `task._.files`
		this._.files = files;
	});
};
