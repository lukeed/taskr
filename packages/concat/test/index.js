'use strict';

const {join} = require('path');
const Taskr = require('taskr');
const test = require('tape');

const bun = 'out.js';
const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, '.tmp');
const tar = join(tmp, bun);

test('@taskr/concat', t => {
	t.plan(8);

	const taskr = new Taskr({
		plugins: [
			require('@taskr/clear'),
			require('../')
		],
		tasks: {
			*a(f) {
				// test #1: str
				yield f.source(`${dir}/*.js`).concat(bun).target(tmp);
				const arr1 = yield f.$.expand(`${tmp}/*`);
				const out1 = yield f.$.find(bun, tmp);
				t.equal(out1, tar, 'via str; create `output` file');
				t.equal(arr1.length, 1, 'via str; do not create a sourcemap');
				yield f.clear(tmp);
				yield f.start('b');
			},
			*b(f) {
				// test #2: obj w/ `map`
				yield f.source(`${dir}/*.js`).concat({ output:bun, map:true }).target(tmp);
				const arr1 = yield f.$.expand(`${tmp}/*`);
				const out1 = yield f.$.find(bun, tmp);
				const out2 = yield f.$.find(`${bun}.map`, tmp);
				t.equal(out1, tar, 'via obj w/ `map`; create `output` file');
				t.ok(arr1.length === 2 && out2.length, 'via obj w/ `map`; create a sourcemap');
				yield f.clear(tmp);
				yield f.start('c');
			},
			*c(f) {
				// test #3: obj w/ `map` and `base`
				yield f.source(`${dir}/*.js`).concat({ output:bun, map:true, base:tmp }).target(tmp);
				const arr1 = yield f.$.expand(`${tmp}/*`);
				const out1 = yield f.$.find(bun, tmp);
				const out2 = yield f.$.find(`${bun}.map`, tmp);
				t.equal(out1, tar, 'via obj w/ `map` & `base`; create `output` file');
				t.ok(arr1.length === 2 && out2.length, 'via obj w/ `map` & `base`; create a sourcemap');
				yield f.clear(tmp);
				yield f.start('d');
			},
			*d(f) {
				// test #4: obj w/ `map` & `base` (nested)
				yield f.source(`${dir}/sub/**/*.js`).concat({ output:bun, map:true, base:tmp }).target(tmp);
				const arr1 = yield f.$.expand(`${tmp}/*`);
				const out1 = yield f.$.find(bun, tmp);
				const out2 = yield f.$.find(`${bun}.map`, tmp);
				t.equal(out1, tar, 'via obj w/ `map` & `base` (nested); create `output` file');
				t.ok(arr1.length === 2 && out2.length, 'via obj w/ `map` & `base` (nested); create a sourcemap');
				yield f.clear(tmp);
			}
		}
	});

	taskr.start('a');
});
