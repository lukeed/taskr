'use strict';

const format = require('path').format;
const execa = require('execa').shell;

const NAME = '@taskr/shell';

module.exports = function (task, utils) {
	const setError = str => task.emit('plugin_error', { error:str, plugin:NAME });

	task.plugin('shell', { every:false }, function * (files, cmd, opts) {
		opts = opts || {};

		if (typeof cmd !== 'string') {
			opts = cmd;
			cmd = opts.cmd;
		}

		const args = opts.args || [];

		if (!cmd) {
			return setError('No command received!');
		}

		const isGlob = opts.glob || false;

		// output header
		const head = `${NAME}:${isGlob ? '\n\t' : ' '}`;
		const tail = isGlob ? '\n\t' : '\n';

		const runWith = str => {
			// use file or glob
			const c = cmd.replace(/\$(file|glob)/gi, str);
			// pass all args to execa
			return execa.apply(this, [c, args, opts]).then(res => {
				utils.log(head + res.stdout.replace(/\n/g, tail));
			}).catch(err => {
				setError(err.message);
			});
		};

		const src = isGlob ? this._.globs : files.map(format);
		return yield Promise.all(src.map(runWith));
	});
};
