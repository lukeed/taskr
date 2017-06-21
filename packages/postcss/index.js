'use strict';

const res = require('path').resolve;
const postcss = require('postcss');

const base = { plugins:[], options:{} };
const isObject = any => Boolean(any) && (any.constructor === Object);
const isEmptyObj = any => isObject(any) && Object.keys(any).length === 0;

module.exports = function (task, utils) {
	const rootPath = str => res(task.root, str);
	const findRoot = str => utils.find(rootPath(str));
	const readRoot = str => utils.read(rootPath(str), 'utf8');
	const setError = msg => task.emit('plugin_error', { plugin:'@taskr/postcss', error:msg });

	task.plugin('postcss', { every:false }, function * (files, opts) {
		let config;

		if (isEmptyObj(opts)) {
			console.log('WAS NULL OPTS', task.root);
			// look for `.postcssrc` or "postcss" key in `package.json`
			config = JSON.parse(yield readRoot('.postcssrc')) || JSON.parse(yield readRoot('package.json') || '{}').postcss;
			// these files will only be JSON objects (only)
			if (isObject(config)) {
				// reconstruct "plugins"
				let fn, key, plugins = [];
				const old = config.plugins || {};
				for (key in old) {
					console.log(`this is key!!! ${key}`);
					try {
						console.log(key, old[key]);
						fn = require(key)(old[key] || {});
						plugins.push(fn);
					} catch (err) {
						console.log('errored', err);
						return setError(`Loading PostCSS plugin (${key}) failed with: ${err.message}`);
					}
				}
				// update config
				config.plugins = plugins;
			} else {
				// look for `postcss.config.js` or `.postcssrc.js`
				const fileConfig = (yield findRoot('postcss.config.js')) || (yield findRoot('.postcssrc.js'));
				if (fileConfig !== null) {
					// pass thru `require` because always `module.exports`
					config = require(fileConfig);
					// handle function exports, pass default value
					(typeof config === 'function') && (config = config(base));
				}
			}
		} else {
			config = opts; // wasnt empty
		}

		config = config || {};

		console.log('FINAL CONFIG', config);

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
