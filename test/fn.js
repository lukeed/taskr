/* eslint no-array-constructor:0,no-new-object:0,no-new-func:0,prefer-arrow-callback:0 */
'use strict';

const test = require('tape');
const $ = require('../lib/fn');

test('fn.isArray', t => {
	const fn = $.isArray;

	t.true(fn([]), `true: []`);
	t.true(fn([1]), `true: [1]`);
	t.true(fn(new Array()), `true: new Array()`);
	t.true(fn(Array.prototype), `true: Array.prototype`);

	t.false(fn(), `false: blank`);
	t.false(fn({}), `false: {}`);
	t.false(fn(null), `false: null`);
	t.false(fn(undefined), `false: undefined`);
	t.false(fn(15), `false: 15`);
	t.false(fn('Array'), `false: 'Array'`);
	t.false(fn(true), `false: true`);
	t.false(fn(false), `false: false`);

	t.end();
});

test('fn.isObject', t => {
	const fn = $.isObject;

	t.true(fn({}), `true: {}`);
	t.true(fn({a: 'a'}), `true: {a: 'a'}`);
	t.true(fn(new Object()), `true: new Object`);
	t.true(fn(Object.assign({})), `true: Object.assign({})`);

	t.false(fn(), `false: blank`);
	t.false(fn([]), `false: []`);
	t.false(fn(null), `false: null`);
	t.false(fn(undefined), `false: undefined`);
	t.false(fn(15), `false: 15`);
	t.false(fn('Array'), `false: 'Array'`);
	t.false(fn('Object'), `false: 'Object'`);
	t.false(fn(function () {}), `false: function () {}`);
	t.false(fn(new Function()), `false: new Function`);
	t.false(fn(new Date()), `false: new Date`);
	t.false(fn(true), `false: true`);
	t.false(fn(false), `false: false`);

	t.end();
});

test('fn.isEmptyObj', t => {
	const fn = $.isEmptyObj;

	const o1 = {};
	const o2 = {};

	// enumerable: false ~~> default
	Object.defineProperty(o1, 'key', {value: 'any'});

	Object.defineProperty(o2, 'key', {
		enumerable: true,
		value: 'any'
	});

	t.true(fn({}), `true: {}`);
	t.true(fn(new Object()), `true: new Object()`);
	t.false(fn({a: 1}), `false: {a: 1}`);
	t.false(fn([]), `false: []`);
	t.false(fn(new Function()), `false: new Function()`);
	t.false(fn(new Date()), `false: new Date()`);

	t.true(fn(o1), 'true: valued object with `{enumerable: false}`');
	t.false(fn(o2), 'false: valued object with `{enumerable: true}`');

	t.end();
});

test('fn.toArray', t => {
	const fn = $.toArray;
	t.deepEqual(fn([]), [], 'keeps `[]` as is');
	t.deepEqual(fn(null), [], 'converts `null` to empty array');
	t.deepEqual(fn(undefined), [], 'converts `undefined` to empty array');
	t.deepEqual(fn(-1), [-1], 'converts `-1` to `[-1]`');
	t.deepEqual(fn(0), [0], 'converts `0` to `[0]`');
	t.deepEqual(fn(1), [1], 'converts `1` to `[1]`');
	t.deepEqual(fn('foo'), ['foo']);
	t.deepEqual(fn(['foo']), ['foo']);
	t.end();
});

test('fn.formatTime', t => {
	const fn = $.formatTime;
	t.equal(fn(-1), '-1ms', 'accepts negative numbers');
	t.equal(fn(0), '0ms', 'accepts zero');
	t.equal(fn(999), '999ms', 'accepts positive number');
	t.equal(fn(1000), '1s', 'converts 1000ms');
	t.equal(fn(2222), '2.2s', 'converts large, quirky number');
	t.end();
});

test('fn.getTime', t => {
	const out = $.getTime();
	t.equal(typeof out, 'string', 'returns a string');
	t.equal(out.split(':').length, 3, 'has 3 segments');
	t.equal(out.length, 8, 'is always 8 characters long');
	t.end();
});

test('fn.valUniq', t => {
	const fn = $.valUniq;
	const arr = ['a', 'b', 'a1', 'a2', 'a3'];

	const out1 = fn('a', arr);
	t.equal(typeof out1, 'string', 'returns a string');
	t.equal(out1, 'a4', 'loops increment multiple times');

	const out2 = fn('b', arr);
	t.equal(out2, 'b1', 'increments once');

	const out3 = fn('c', arr);
	t.equal(out3, 'c', 'does nothing if was unique');

	t.end();
});

test('fn.getUniques', t => {
	const fn = $.getUniques;
	t.deepEqual(fn([1, 2, 2, 3, 1, 2, 4]), [1, 2, 3, 4]);
	t.deepEqual(fn(['a', 'a', 'b', 'a', 'c', 'a', 'd']), ['a', 'b', 'c', 'd']);
	t.end();
});
