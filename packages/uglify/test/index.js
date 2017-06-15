'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');

test('@taskr/uglify', t => {
	t.plan(4);

	const taskr = new Taskr({
		plugins: [
			require('../'),
			require('@taskr/clear')
		],
		tasks: {
			* foo(f) {
				const src = `${dir}/**/*.js`;
				t.ok('uglify' in taskr.plugins, 'attach `uglify()` plugin to taskr');

				yield f.source(src).uglify().target(tmp);
				const str1 = yield f.$.read(`${tmp}/a.js`, 'utf8');
				t.equal(str1, `console.log("this is a");`, 'apply `uglify-js` to content');
				const arr1 = yield f.$.expand(`${tmp}/**/*.js`);
				t.equal(arr1.length, 2, 'keep all files');

				/* eslint camelcase:0 */
				yield f.source(src).uglify({compress: { drop_console:true }}).target(tmp);
				const str2 = yield f.$.read(`${tmp}/a.js`, 'utf8');
				t.equal(str2, '', 'accept custom config (`compress` options)');

				yield f.clear(tmp);
			}
		}
	});

	taskr.start('foo');
});
