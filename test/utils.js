const fs = require('fs');
const path = require('path');
const test = require('tape').test;
const utils = require('../lib/utils');
const join = path.join;

const fixtures = join(process.cwd(), 'test', 'fixtures', 'utils');

function asyncFunc(value, handler) {
	setTimeout(() => handler(undefined, value), 100);
}

function asyncFuncWithOptions(value, options, handler) {
	setTimeout(() => handler(undefined, value), options.time);
}

test('fly utilities ✈', t => {
	t.ok(utils !== undefined, 'it\'s real');

	['defer', 'find', 'log', 'error', 'alert', 'stamp', 'trace']
		.forEach(prop => {
			t.ok(utils[prop] !== undefined, `${prop} is defined`);
		});

	t.end();
});

test('utils.defer (asyncFunc) ✈', t => {
	t.plan(1);
	utils.defer(asyncFunc)(42).then(value => {
		t.equal(value, 42, 'promisifies an async func');
	});
});

test('utils.defer (asyncFunc w/ options) ✈', t => {
	t.plan(1);
	utils.defer(asyncFuncWithOptions)(1985, {time: 100}).then(value => {
		t.equal(value, 1985, 'promisifies an async func w/ options');
	});
});

test('utils.find (flyfile) ✈', t => {
	t.plan(4);

	const name = 'flyfile.js';
	const full = join(fixtures, name);

	utils.find(name, fixtures).then(fp => {
		t.ok(fp !== undefined, 'finds a flyfile, given a directory');
		t.equal(fp, full, 'finds the right one!');
	});

	utils.find(full).then(fp => {
		t.equal(fp, full, 'finds a flyfile, given a filepath');
	});

	const dir = join(fixtures, 'one'); // test dir
	utils.find(name, dir).then(fp => {
		t.equal(fp, full, 'finds a flyfile, traversing upwards');
	});
});

test('utils.read (file)', t => {
	const fp = join(fixtures, 'a.js');
	utils.read(fp).then(data => {
		t.equal(data.toString(), 'const pi = 3.14\n', 'reads file contents');
		t.end();
	});
});

test('utils.read (dir)', t => {
	utils.read(fixtures).then(data => {
		t.true(data === null, 'will not attempt to read a directory');
		t.end();
	});
});

test('utils.write', t => {
	const fp = join(fixtures, 'test.js');
	const data = 'hello';

	utils.write(fp, data).then(() => {
		return utils.find(fp).then(f => {
			t.true(f !== undefined, 'file was created');

			return utils.read(fp).then(d => {
				t.deepEqual(d.toString(), data, 'file had data');

				// delete test file
				fs.unlinkSync(fp);

				t.end();
			});
		});
	});
});
