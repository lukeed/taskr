'use strict';

const res = require('path').resolve;
const postcss = require('postcss');

const base = { plugins:[], options:{} };
const isObject = any => Boolean(any) && (any.constructor === Object);
const isNullType = any => any == null;

module.exports = function (task, utils) {
	const rootPath = str => res(task.root, str);
	const findRoot = str => utils.find(rootPath(str));
	const readRoot = str => utils.read(rootPath(str), 'utf8');
	const setError = msg => task.emit('plugin_error', { plugin:'@taskr/postcss', error:msg });

	task.plugin('postcss', { every:false }, function * (files, opts) {
		let config;

		if (isObject(opts)) {
			config = opts;
		} else if (isNullType(opts)) {
			// look for `.postcssrc` or "postcss" key in `package.json`
			config = JSON.parse(yield readRoot('.postcssrc')) || JSON.parse(yield readRoot('package.json')).postcss;
			if (isNullType(config)) {
				// look for `postcss.config.js` or `.postcssrc.js`
				const fileConfig = (yield findRoot('postcss.config.js')) || (yield findRoot('.postcssrc.js'));
				if (!isNullType(fileConfig)) {
					// pass thru `require` because always `module.exports`
					config = require(fileConfig);
					// handle function exports, pass default value
					(typeof config === 'function') && (config = config(base));
				}
			}
		}

		config = config || {};

		if (!isObject(config)) {
			return setError(`Invalid PostCSS config! An object is required; recevied: ${typeof config}`);
		}

		opts = Object.assign({}, base, config);

		for (const file of files) {
			try {
				const ctx = postcss(opts.plugins);
				const out = yield ctx.process(file.data.toString(), opts);
				file.data = Buffer.from(out.css); // write new data
			} catch (err) {
				return setError(err.message);
			}
		}
	});
}
