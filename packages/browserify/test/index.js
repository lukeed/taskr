'use strict';

const join = require('path').join;
const test = require('tape').test;
const Taskr = require('taskr');

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');

test('@taskr/browserify', t => {
	t.plan(13);

	const taskr = new Taskr({
		plugins: [{
			func: require('../')
		}],
		tasks: {
			a: function * () {
				const all = `${dir}/**/*.js`;
				const chk = '(function e(t,n,r){';

				const read = a => this.$.read(`${tmp}/${a}`, 'utf8');
				const open = () => this.$.expand(`${tmp}/**/*.js`);

				t.true('browserify' in taskr, 'attach `browserify()` plugin to taskr');

				yield this.source(all).browserify().target(tmp);
				const arr1 = yield open();
				const str1 = yield read('foo.js');
				t.equal(arr1.length, 4, 'loop thru all `source` files by default');
				t.true(str1.indexOf(chk) !== -1, 'bundle each file by default');
				yield this.clear(tmp);

				yield this.source(`${dir}/foo.js`).browserify().target(tmp);
				const arr2 = yield open();
				const str2 = yield read('foo.js');
				t.equal(arr2.length, 1, 'use `source` files by default');
				t.true(str2.indexOf(chk) !== -1, 'bundle file contents by default');
				yield this.clear(tmp);

				yield this.source(`${dir}/*.js`).browserify().target(tmp);
				const arr3 = yield open();
				const str3 = yield read('foo.js');
				t.equal(arr3.length, 1, 'accept `source` globs');
				t.true(str3.indexOf(chk) !== -1, 'bundle file conents');
				yield this.clear(tmp);

				yield this.source(all).browserify({entries: `${dir}/sub/index.js`}).target(tmp);
				const arr4 = yield open();
				const str4 = yield read('sub/index.js');
				t.equal(arr4.length, 1, 'prefer `opts.entries` over `source` value; single (string)');
				t.true(str4.indexOf(chk) !== -1, 'bundle file contents');
				yield this.clear(tmp);

				yield this.source(all).browserify({
					entries: [`${dir}/foo.js`, `${dir}/sub/index.js`]
				}).target(tmp);
				const arr5 = yield open();
				const str5 = yield read('foo.js');
				t.equal(arr5.length, 2, 'prefer `opts.entries` over `source` value; multiple (array)');
				t.true(str5.indexOf(chk) !== -1, 'bundle each file');
				yield this.clear(tmp);

				const opt = {presets: ['es2015']};
				const es5 = `var obj = { hello: 'world' };`;

				yield this.source(`${dir}/sub/baz.js`).browserify({
					transform: [require('babelify').configure(opt)]
				}).target(tmp);
				const str6 = yield read('baz.js');
				t.true(str6.indexOf(es5) !== -1, 'apply `opts.transform` using `require()`');
				yield this.clear(tmp);

				yield this.source(`${dir}/sub/baz.js`).browserify({
					transform: [['babelify', opt]]
				}).target(tmp);
				const str7 = yield read('baz.js');
				t.true(str7.indexOf(es5) !== -1, 'apply `opts.transform` using `array`');
				yield this.clear(tmp);
			}
		}
	});

	taskr.start('a');
});
