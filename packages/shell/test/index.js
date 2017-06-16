'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

let num = 0;
const outlog = () => num++;
const dir = join(__dirname, 'fixtures');

const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/shell', t => {
	t.plan(5);
	const glob = `${dir}/*.js`;

	const taskr = new Taskr({
		plugins: [
			require('../'),
			require('@taskr/clear')
		],
		tasks: {
			*foo(f) {
				t.true('shell' in f, 'attach the `shell()` plugin to internal task');
			},
			*bar(f) {
				yield f.source(glob).shell('cat $file').target('.tmp');
				const arr = yield f.$.expand('.tmp/*');
				t.equal(arr.length, 3, 'sends both files to target');
				yield f.clear('.tmp');
			},
			*baz(f) {
				num = 0;
				f.$.log = outlog;
				yield f.source(glob).shell('cat $file');
				t.equal(num, 3, 'runs `cat` on each file individually');
			},
			*bat(f) {
				num = 0;
				f.$.log = outlog;
				yield f.source(glob).shell('cat $file', { glob:true });
				t.equal(num, 1, 'runs `cat` once per glob');
			}
		}
	});

	t.true('shell' in taskr.plugins, 'attach the `shell()` plugin to taskr');

	taskr.serial(['foo', 'bar', 'baz', 'bat']);
});
