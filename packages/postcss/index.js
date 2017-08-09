'use strict';

const res = require('path').resolve;
const postcss = require('postcss');

const base = { plugins:[], options:{} };
const filenames = ['.postcssrc', '.postcssrc.js', 'postcss.config.js', 'package.json'];

const isString = any => typeof any === 'string';
const isObject = any => !!any && typeof any === 'object' && !Array.isArray(any);
const isEmptyObj = any => isObject(any) && Object.keys(any).length === 0;

module.exports = function (task, utils) {
	const rootDir = str => res(task.root, str);
	const setError = msg => task.emit('plugin_error', { plugin:'@taskr/postcss', error:msg });
	const getConfig = arr => Promise.all(arr.map(utils.find)).then(res => res.filter(Boolean)).then(res => res[0]);

	task.plugin('postcss', { every:false }, function * (files, opts) {
		let config, isJSON = false;

		if (isEmptyObj(opts)) {
			// autoload a file
			const fileConfig = yield getConfig(filenames.map(rootDir));
			// process if found one!
			if (fileConfig !== void 0) {
				try {
					config = require(fileConfig);
				} catch (err) {
					try {
						isJSON = true; // .rc file
						config = JSON.parse(yield utils.read(fileConfig, 'utf8'));
					} catch (_) {
						return setError(err.message);
					}
				}
				// handle config types
				if (typeof config === 'function') {
					config = config(base); // send default values
				} else if (isObject(config)) {
					// grab "postcss" key (package.json)
					if (config.postcss !== void 0) {
						config = config.postcss;
						isJSON = true;
					}

					// reconstruct plugins?
					if (isObject(config.plugins)) {
						let k, plugins=[];
						for (k in config.plugins) {
							try {
								plugins.push(require(k)(config.plugins[k]));
							} catch (err) {
								return setError(`Loading PostCSS plugin (${k}) failed with: ${err.message}`);
							}
						}
						config.plugins = plugins; // update config
					} else if (isJSON && Array.isArray(config.plugins)) {
						const truthy = config.plugins.filter(Boolean);
						let i=0, len=truthy.length, plugins=[];
						for (; i<len; i++) {
							try {
								plugins.push(require(truthy[i]));
							} catch (err) {
								return setError(`Loading PostCSS plugin (${truthy[i]}) failed with: ${err.message}`);
							}
						}
						config.plugins = plugins; // update config
					}

					// reconstruct options
					if (config.options !== void 0) {
						const co = config.options;
						config.options.parser = isString(co.parser) ? require(co.parser) : co.parser;
						config.options.syntax = isString(co.syntax) ? require(co.syntax) : co.syntax;
						config.options.stringifier = isString(co.stringifier) ? require(co.stringifier) : co.stringifier;
						(co.plugins !== void 0) && (delete config.options.plugins);
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
