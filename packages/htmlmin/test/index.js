'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');

test('@taskr/htmlmin', t => {
	t.plan(3);

	const taskr = new Taskr({
		plugins: [
			require('../'),
			require('@taskr/clear')
		],
		tasks: {
			* foo(f) {
				// #1
				yield f.source(`${dir}/foo.html`).htmlmin().target(tmp);
				const str1 = yield f.$.read(`${tmp}/foo.html`, 'utf8');
				t.equal(str1, '<p title=blah id=moo>foo</p>', 'via defaults; minify html');

				// #2
				yield f.source(`${dir}/foo.html`).htmlmin({ removeAttributeQuotes:false }).target(tmp);
				const str2 = yield f.$.read(`${tmp}/foo.html`, 'utf8');
				t.equal(str2, '<p title="blah" id="moo">foo</p>', 'via config; minify html');

				yield f.clear(tmp);
			}
		}
	});

	t.ok('htmlmin' in taskr.plugins, 'attach `htmlmin()` plugin to taskr');

	taskr.start('foo');
});
