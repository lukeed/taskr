/* eslint no-array-constructor:0,no-new-object:0,no-new-func:0,prefer-arrow-callback:0 */
'use strict';

const test = require('tape').test;
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

test('fn.formatTime', t => {
	const fn = $.formatTime;
	t.equal(fn(-1), '-1ms', 'accepts negative numbers');
	t.equal(fn(0), '0ms', 'accepts zero');
	t.equal(fn(999), '999ms', 'accepts positive number');
	t.equal(fn(1000), '1s', 'converts 1000ms');
	t.equal(fn(2222), '2.2s', 'converts large, quirky number');

	t.end();
});
