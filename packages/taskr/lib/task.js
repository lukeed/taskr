'use strict';

const p = require('path');
const Promise = require('bluebird');
const wrapp = require('./wrapp');
const util = require('./utils');
const boot = require('./boot');
const $ = require('./fn');

const RGX = /[\\|\/]/g;
const co = Promise.coroutine;
const normalize = p.normalize;
const format = p.format;
const parse = p.parse;
const sep = p.sep;

function Task(ctx) {
	// construct shape
	this.$ = util;
	this.root = ctx.root;
	this._ = { files:[], globs:[], prevs:[] };
	// attach parent fns to Task
	this.parallel = ctx.parallel.bind(ctx);
	this.serial = ctx.serial.bind(ctx);
	this.start = ctx.start.bind(ctx);
	this.emit = ctx.emit.bind(ctx);
	// attach `ctx.plugins` to prototype
	for (const k in ctx.plugins) {
		this[k] = ctx.plugins[k].bind(this);
	}
	// return chained methods + shared
	return boot(this);
}

Task.prototype.exec = function (fn, opts, data) {
	// cache ref to `ctx.tasks[].data` values
	this._ = data;
	return fn.call(this, this, opts);
};

Task.prototype.run = co(function * (opts, func) {
	return yield wrapp(opts, func).call(this);
});

Task.prototype.source = co(function * (globs, opts) {
	globs = $.flatten($.toArray(globs));
	const files = yield this.$.expand(globs, opts);

	if (globs.length && !files.length) {
		this.emit('globs_no_match', globs, opts);
	}

	// pre-fetch each file's content
	const datas = yield Promise.all(files.map(f => this.$.read(f)));

	// update known globs
	this._.globs = globs;
	// update known files, as (mod'd) `pathObject`s
	this._.files = files.map((el, idx) => {
		const obj = parse(el);
		return {
			dir: normalize(obj.dir),
			data: datas[idx],
			base: obj.base
		};
	});
});

Task.prototype.target = co(function * (dirs, opts) {
	dirs = $.flatten($.toArray(dirs));
	opts = opts || {};

	const files = this._.files;
	// using `watcher`? original globs passed as `prevs`
	// non-wildcard glob segments that should be trimmed!
	const globs = (this._.prevs.length > 0) ? this._.prevs : this._.globs;

	const trims = globs.map(g => {
		let seg = g.split(RGX);
		const idx = seg.findIndex(str => str.includes('*'));

		if (idx === -1) {
			seg.pop();
		} else {
			seg = seg.slice(0, idx);
		}

		return normalize(seg.join(sep));
	}).sort((a, b) => b.length - a.length);

	const tLength = trims.length;

	return yield Promise.all(
		$.flatten(
			files.map(obj => dirs.map(d => {
				let i = 0;
				// clone `pathObject` per target dir
				const o = { dir:obj.dir, base:obj.base };
				// replace `source` segments with `target` dir
				for (; i < tLength; i++) {
					o.dir = o.dir.replace(trims[i], d);
				}
				// create final filepath & write to it!
				return this.$.write(format(o), obj.data, opts);
			}))
		)
	);
});

module.exports = Task;
