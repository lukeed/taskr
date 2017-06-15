'use strict';

const unzip = require('zlib').gunzipSync;
const join = require('path');.join;
const Taskr = require('taskr');
const test = require('tape');

const tmp = join(__dirname, 'tmp');
const file = join(__dirname, 'a.txt');

test('@taskr/gzip', t => {
	t.plan(6);

	const taskr = new Taskr({
		plugins: [
			require('../'),
			require('@taskr/clear')
		],
		tasks: {
			* foo(f) {
				yield f.source(file).gzip().target(tmp);

				const arr = yield f.$.expand(`${tmp}/*.*`);
				const str = yield f.$.read(`${tmp}/a.txt.gz`);
				t.equal(arr.length, 2, 'create two files');
				t.ok(str, 'use default `gz` extension');
				t.equal(unzip(str).toString(), 'Hello world!\n', 'can decompress the file correctly');

				yield f.clear(tmp);
			},
			* bar(f) {
				yield f.source(file).gzip({threshold: 1024}).target(tmp);
				const arr = yield f.$.expand(`${tmp}/*.*`);
				t.equal(arr.length, 1, 'do not use `gzip` if file is too small');
				yield f.clear(tmp);
			},
			* baz(f) {
				yield f.source(file).gzip({ext: 'fake'}).target(tmp);
				const arr = yield f.$.expand(`${tmp}/*.fake`);
				t.equal(arr.length, 1, 'pass a custom extension');
				yield f.clear(tmp);
			}
		}
	});

	t.ok('gzip' in taskr.plugins, 'attach `gzip` function to Taskr');

	taskr.serial(['foo', 'bar', 'baz']);
});
