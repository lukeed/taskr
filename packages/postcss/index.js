'use strict';

const res = require('path').resolve;
const postcss = require('postcss');

const base = { plugins:[], options:{} };
const filenames = ['.postcssrc', '.postcssrc.js', 'postcss.config.js', 'package.json'];

const isObject = any => Boolean(any) && (any.constructor === Object);
const isEmptyObj = any => isObject(any) && Object.keys(any).length === 0;

module.exports = function (task, utils) {
	const rootDir = str => res(task.root, str);
	const setError = msg => task.emit('plugin_error', { plugin:'@taskr/postcss', error:msg });
	const getConfig = arr => Promise.all(arr.map(utils.find)).then(res => res.filter(Boolean)).then(res => res[0]);

	task.plugin('postcss', { every:false }, function * (files, opts) {
		let config;

		if (isEmptyObj(opts)) {
			// autoload a file
			const fileConfig = yield getConfig(filenames.map(rootDir));
			// process if found one!
			if (fileConfig !== void 0) {
				try {
					config = require(fileConfig);
				} catch (err) {
					try {
						config = JSON.parse(yield utils.read(fileConfig, 'utf8')); // .rc file
					} catch (_) {
						return setError(err.message);
					}
				}
				// handle config types
				if (typeof config === 'function') {
					config = config(base); // send default values
				} else if (isObject(config)) {
					// grab "postcss" key (package.json)
					config = config.postcss || config;
					// reconstruct plugins?
					if (isObject(config.plugins)) {
						let k, plugins = [];
						const old = config.plugins || {};
						for (k in old) {
							try {
								plugins.push(require(k)(old[k]));
							} catch (err) {
								return setError(`Loading PostCSS plugin (${k}) failed with: ${err.message}`);
							}
						}
						// update config
						config.plugins = plugins;
					}
				}
			}
		}

		config = config || opts;

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
