'use strict';

const Script = require('vm').Script;
const dirname = require('path').dirname;
const rImports = require('rewrite-imports');
const req = require('require-like');

const fn = 'function*';
const box = {};

module.exports = function (file, data) {
	// setup mock env
	Object.assign(box, global);
	box.module = { exports };
	box.exports = exports;
	box.require = req(file);

	box.__dirname = dirname(file);
	box.__filename = file;

	const scr = new Script(
		rImports(data)
			.replace(/await/gi, 'yield')
			.replace(/export /gi, 'exports.')
			.replace(/default async function/gi, `default = ${fn}`)
			.replace(/async function(\s)?.+?(?=\()/gi, str => str.trim().split(' ').pop().concat(` = ${fn} `))
	);
	// `eval()` new content
	scr.runInNewContext(box);
	// return new `tasks` object
	return box.module.exports;
};
