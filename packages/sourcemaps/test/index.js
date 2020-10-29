"use strict"

const test = require("tape");
const join = require("path").join;
const parse = require("path").parse;
const co = require("bluebird").coroutine;
const read = require('../utils/read');

const applySourceMap = require('../').applySourceMap;
const loadSourceMap = require('../').loadSourceMap;
const initSourceMaps = require('../').initSourceMaps;
const writeSourceMaps = require('../').writeSourceMaps;

const fixture = file => join(__dirname, 'fixtures', file);

const loadFixture = co(function * (file) {
	return JSON.parse(yield read(fixture(file)));
});
const prepareFile = co(function * (file, sourceMap) {
	const filePath = fixture(file);
	const parsed = parse(filePath);

	const prepared = {
		dir: parsed.dir,
		base: parsed.base,
		data: yield read(filePath)
	};

	if (sourceMap) {
		sourceMap = yield loadFixture(sourceMap);
		applySourceMap(prepared, sourceMap);
	}

	return prepared;
});

test("applySourceMap", co(function * (t) {
	t.plan(4);

	let file, sourceMap;

	file = {};
	sourceMap = { file: 'a.js', mappings: ['...'], sources: ['b.js'] };
	applySourceMap(file, sourceMap);

	t.deepEqual(file.sourceMap, sourceMap, 'applies sourcemap');

	file = {};
	sourceMap = { file: 'nested\\a.js', mappings: ['...'], sources: ['nested\\b.js'] };
	applySourceMap(file, sourceMap);

	t.equal(file.sourceMap.file, 'nested/a.js', 'normalizes source map file');
	t.equal(file.sourceMap.sources[0], 'nested/b.js', 'normalizes source map sources');

	file = {
		sourceMap: yield loadFixture('existing.js.map')
	};
	sourceMap = yield loadFixture('applied.js.map');
	applySourceMap(file, sourceMap);

	t.deepEqual(file.sourceMap, yield loadFixture('merged.js.map'), 'merges source map into existing');
}));

test("loadSourceMap", co(function * (t) {
	t.plan(3);

	let file, sourceMap, expected;

	file = yield prepareFile('say-hi-internal.js');
	sourceMap = yield loadSourceMap(file);
	expected = yield loadFixture('say-hi-internal.js.map');

	t.deepLooseEqual(sourceMap, expected, 'loads internal source map');

	file = yield prepareFile('say-hi-external.js');
	sourceMap = yield loadSourceMap(file);
	expected = yield loadFixture('say-hi-external.js.map');

	t.deepLooseEqual(sourceMap, expected, 'loads external source map');

	file = yield prepareFile('say-hi.js');
	sourceMap = yield loadSourceMap(file);
	expected = undefined;

	t.equal(sourceMap, expected, 'returns undefined for no source map');
}));

test("initSourceMaps", co(function * (t) {
	t.plan(6);

	const files = yield Promise.all([
		prepareFile('say-hi.js'),
		prepareFile('say-hi-internal.js'),
		prepareFile('say-hi-external.js')
	]);

	yield initSourceMaps(files);
	t.equal(files[1].sourceMap.version, 3, 'initializes empty source map with version = 3');
	t.equal(files[1].sourceMap.mappings, '', 'initializes empty source map with empty mappings');
	t.deepEqual(files[1].sourceMap.sources, ['say-hi-internal.js'], 'initializes empty source map with sources');
	t.deepEqual(files[1].sourceMap.sourcesContent, [files[1].data.toString()], 'initializes empty source map with sourcesContent');

	yield initSourceMaps(files, { load: true });
	t.deepEqual(files[1].sourceMap, yield loadFixture('say-hi-internal.js.map'), 'loads existing internal source map');
	t.deepEqual(files[2].sourceMap, yield loadFixture('say-hi-external.js.map'), 'loads existing external source map');
}));

test("writeSourceMaps", co(function * (t) {
	t.plan(5);

	let file, files, data, sourceMap;

	file = yield prepareFile('say-hi.js', 'say-hi-external.js.map');
	file.base = 'say-hi-internal.js';
	files = [file];
	data = yield read(fixture('say-hi-internal.js'));

	yield writeSourceMaps(files);
	t.deepEqual(file.data.toString(), data.toString(), 'writes inline sourcemap by default');

	file = yield prepareFile('say-hi.js', 'say-hi-external.js.map');
	file.base = 'say-hi-external.js';
	files = [file];
	data = yield read(fixture('say-hi-external.js'));
	sourceMap = yield read(fixture('say-hi-external.js.map'));

	yield writeSourceMaps(files, '.');
	t.deepEqual(file.data.toString(), data.toString(), 'writes external sourcemap comment with string option');
	t.deepEqual(files[1].data.toString(), sourceMap.toString(), 'writes external sourcemap with string option');

	file = yield prepareFile('say-hi.js', 'say-hi-external.js.map');
	file.base = 'say-hi-external.js';
	files = [file];
	data = yield read(fixture('say-hi-external.js'));
	sourceMap = yield read(fixture('say-hi-external.js.map'));

	yield writeSourceMaps(files, { dest: '.' });
	t.deepEqual(file.data.toString(), data.toString(), 'writes external sourcemap comment with options');
	t.deepEqual(files[1].data.toString(), sourceMap.toString(), 'writes external sourcemap with options')
}));
