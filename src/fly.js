'use strict';

var co = require('co');
var path = require('path');
var util = require('util');
var debug = require('debug');
var mkdirp = require('mkdirp');
var expand = require('globby');
var chokidar = require('chokidar');
var assign = require('object-assign');
var Cat = require('concat-with-sourcemaps');

var Emitter = require('./emitter');
var utils = require('./utils');

// import { dirname, join, parse, sep } from "path"
// import { readFile, writeFile } from "mz/fs"
// import { log, alert, error, defer, flatten } from "./utils"
var _ = utils.debug('fly');
var clear = utils.defer(require('./rimraf'));

function Fly(options) {
	if (!(this instanceof Fly)) {
		throw new TypeError('Fly cannot be invoked without \'new\'');
	}

	// constructor defaults
	options = options || {};
	var host = options.host || {};
	var file = options.file || '.';
	var plugins = options.plugins || [];

	// ~ `super()`
	Emitter.call(this);

	// attach files & funcs into the curr instance
	assign(this, {
		file: file,
		plugins: plugins,
		root: path.dirname(file),
		alert: utils.alert,
		error: utils.error,
		defer: utils.defer,
		log: utils.log,
		host: (typeof host === 'function') ? assign(host, {default: host}) : host,
		debug: _,
		_: {
			filters: []
		},
		tasks: Object.keys(host).reduce(function (_, key) {
			return assign(_, {[key]: host[key].bind(this)});
		}, {})
	});

	plugins.forEach(function (el) {
		if (!el.plugin) {
			throw new Error('Did you forget to `npm i -D ' + el.name + '`?');
		}
		// if (plugin.default) plugin = plugin.default
		el.plugin.call(this, debug(el.name.replace('-', ':')), _('load %o', el.name));
	});

	_('chdir %o', this.root);

	process.chdir(this.root);
}

// `Fly extends emitter`...
util.inherits(Fly, Emitter);
module.exports = Fly;

/**
 * Compose a new, yeildable sequence.
 * Resets instance's glob, filters, and writer.
 *
 * @param  {String|Array} globs The glob selection
 * @return 											The current Fly instance.
 */
Fly.prototype.source = function (globs) {
	assign(this, {
		_: {
			filters: [],
			globs: flatten(globs)
		}
	});

	this._.cat = undefined;
	_('source %o', this._.globs);
	return this;
};

/**
/**
 * Add filter / transform function.
 * Create a closure bound to the current Fly instance.
 *
 * @param {String|Function} name 		The name of filter || the callback
 * @param {Function} 				cb 			the function: (cb, options) => {}
*/
Fly.prototype.filter = function (name, cb) {
	var type = typeof name;

	if (type === 'function') {
		this.filter({cb: name});
	} else if (type === 'object') {
		this._.filters.push(name);
	} else {
		if (typeof this[name] === 'function') {
			throw new RangeError(name + ' method is already defined!');
		}

		this[name] = function (options) {
			var rest = [];
			rest.push.apply(rest, arguments) && rest.shift();

			debug('fly')(`${name} %o, %o`, options, rest);

			return this.filter({
				cb: cb,
				options: options,
				rest: rest
			});
		};
	}

	return this;
};

/**
 * Watch IO events within glob selections & run tasks
 * @param  {String} globs   The glob patterns to observe
 * @param  {String} tasks   The list of tasks to run on file changes
 * @param  {Object} options The options for `Fly.proto.start`
 * @return {void}
 */
Fly.prototype.watch = function (globs, tasks, options) {
	_('watch %o', globs);

	var self = this;
	return self.emit('fly+watch').start(tasks, options).then(function () {
		chokidar.watch(flatten(globs), {ignoreInitial: true}).on('all', function () {
			self.start(tasks, options);
		});
	});
};

/**
 * Unwrap/Expand source globs as single files, then run fn.
 * @param  {Function} onResolved  The callback to run on 'success'.
 * @param  {Function} onRejected  The callback to run on 'error'.
 * @return {Promise}
 */
Fly.prototype.unwrap = function (onResolved, onRejected) {
	var self = this;

	var p = new Promise(function (resolve, reject) {
		// unwrap all globs
		return Promise.all(self._.globs.map(function (glob) {
			return expand(glob);
		})).then(function (files) {
			// then attach 'files' array to instance
			return resolve.call(self, files.reduce(function (arr, item) {
				return arr.concat(item);
			}));
		}).catch(reject);
	});

	return p.then(onResolved).catch(onRejected);
};

/**
 * Execute a single task.
 * @param  {String} task     The name of the task
 * @param  {Mixed}  value    The initial value to pass into `task`
 * @param  {Object} instance The Fly instance `task` should be bound to
 * @return {Mixed}           The task's resulting value.
 */
Fly.prototype.exec = function * (task, value, instance) {
	instance = instance || this;

	_('run %o', task);

	try {
		var start = getTime();

		this.emit('task_start', {
			task: task
		});

		value = (yield this.host[task].call(instance, value)) || value;

		this.emit('task_complete', {
			task: task,
			duration: getTime() - start
		});
	} catch (e) {
		this.emit('task_error', {
			task: task,
			error: e
		});
	}

	return value;
};

/**
 * Run a task sequence of 1 or more.
 * Each task's return value is piped into the next task of sequence.
 *
 * @param  {Array}  tasks   The list of tasks to start
 * @param  {Object} options The options to begin.
 * @return {Promise}
 */
Fly.prototype.start = function (tasks, options) {
	tasks = tasks || 'default';
	options = assign({}, {
		parallel: false,
		value: null
	}, options || {});

	_('start %o in ' + (options.parallel ? 'parallel' : 'sequence'), tasks);

	var self = this;
	var value = options.value;

	return co.call(
		self,
		function * (tasks) {
			if (options.parallel) {
				yield tasks.map(function (task) {
					return self.exec(task, value, Object.create(self));
				});
			} else {
				tasks.map(function * (task) {
					value = yield self.exec(task, value);
				});
			}
			return value;
		},
		[].concat(tasks).filter(function (task) {
			return Object.keys(self.host).indexOf(task) !== -1 || !self.emit('task_not_found', {task: task});
		})
	);
};

/**
 * Deferred `rimraf` wrapper
 * @param  {String|Array} paths The paths to delete
 * @return {void}
 */
Fly.prototype.clear = function (paths) {
	paths = Array.isArray(paths) ? paths : [paths];

	_('clear %o', paths);

	return flatten(paths).map(function (p) {
		clear(p);
	});
};

/**
 * Concatenate active `files` to single file.
 * @param  {String} filename  The single output file
 * @return {Fly}      				The current Fly instance.
 */
Fly.prototype.concat = function (filename) {
	this._.cat = new Cat(false, filename, '\n');
	this._.cat.base = filename;
	return this;
};

module.exports = class Fly extends Emitter {

	/**
		Resolve a yieldable sequence.
		Reduce source with filters and invoke writer.
		@param {Array}  dirs  target directories
		@param {Object} depth target options, for path flattening
		@return {Promise}
	 */
	target (dirs, {depth = -1} = {}) {
		dirs = Array.isArray(dirs) ? dirs : [dirs]

		return co.call(this, function* () {
			for (let glob of this._.globs) {
				for (let file of yield expand(glob)) {
					let { base, ext } = parse(file),
						data = yield readFile(file)

					for (let filter of this._.filters) {
						const res = yield Promise.resolve(
							filter.cb.apply(this, [data, Object
									.assign({ filename: base }, filter.options)]
									.concat(filter.rest))
						)
						data = res.code || res.js || res.css || res.data || res || data
						ext = res.ext || res.extension || ext
					}

					if (this._.cat) {
						this._.cat.add(`${base}`, data)
					} else {
						const base = join(
							...parse(file).dir.split(sep).filter(path => !~glob.split(sep).indexOf(path)),
							`${parse(file).name}${ext}`
						)
						yield resolve(dirs, {data, base, depth})
					}
				}
			}

			if (this._.cat) {
				yield resolve(dirs, {
					data: this._.cat.content,
					base: this._.cat.base,
					write: writeFile,
					depth
				})
			}
		})
	}
}

/** Write utility to help concat and target.
	@param {String}   dirs  parent directory
	@param {String}   base  directory/file
	@param {Mixed}    data
	@param {Integer}  depth number of parent directories to keep
	@param {Function} write promisified writer function
*/
function* resolve (dirs, { base, data, depth, write = writeFile }) {
	if (depth > -1) {
		base = dirpaths(base, depth);
	}

	for (let dir of flatten(dirs)) {
		const file = join(dir, base)
		mkdirp.sync(dirname(file))
		yield write(file, data)
	}
}

/**
 * Shorten a directory string to # of parent dirs
 * @param  {String}  	full    The original full path
 * @param  {Integer}  depth   The number of levels to retain
 * @return {String}
 */
function dirpaths (full, depth) {
	var arr = full.split(sep);
	var len = arr.length;
	return (depth == 0) ? arr[len - 1] : (depth >= len) ? full : arr.slice(len - 1 - depth).join(sep);
}

/**
 * Get the current timestamp
 * @return {Integer}
 */
function getTime() {
	return (new Date()).getTime();
}
