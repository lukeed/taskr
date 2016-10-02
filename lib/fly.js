'use strict'

var co = require('co')
var path = require('path')
var util = require('util')
var debug = require('debug')
var mkdirp = require('mkdirp')
var chokidar = require('chokidar')

var Cat = require('concat-with-sourcemaps')
var assign = require('object-assign')
var flatten = require('flatten')
var expand = require('globby')
var arrify = require('arrify')
var rimraf = require('rimraf')

// locals
var utils = require('./utils')
var Emitter = require('./emitter')
var applyChanges = require('./utils/apply')

// shorthands
var sep = '/'
var _ = debug('fly')
var keys = Object.keys

function Fly(options) {
	var self = this

	if (!(self instanceof Fly)) {
		throw new TypeError('Fly cannot be invoked without \'new\'')
	}

	options = assign({
		host: {},
		plugins: []
	}, options || {})

	// shorter aliases
	var host = options.host
	var file = options.file
	var plugins = options.plugins

	// ~ `super()`
	Emitter.call(self)

	// attach files & funcs into the curr instance
	assign(self, {
		alert: utils.alert,
		error: utils.error,
		defer: utils.defer,
		log: utils.log,
		host: (typeof host === 'function') ? assign(host, {default: host}) : host,
		debug: _,
		_: {
			filters: []
		},
		tasks: keys(host).reduce(function (_, key) {
			var obj = {}
			obj[key] = host[key].bind(self)
			return assign(_, obj)
		}, {})
	})

	if (!file) {
		return
	}

	self.file = file
	self.plugins = plugins
	self.root = path.dirname(file)

	// properties that should not be overwritten
	var sealedProps = utils.arrayToMap([
		'plugins',
		'root',
		'file',
		'debug',
		'host',
		'log',
		'alert',
		'error',
		'tasks'
	])

	// define isolated context for plugins
	var context = utils.shallowCopy({filter: self.filter}, self)

	plugins.forEach(function (el) {
		if (!el.plugin) {
			throw new Error('Did you forget to `npm i -D ' + el.name + '`?')
		}

		el.plugin.call(context, debug(el.name.replace('-', ':')), _('load %o', el.name))
	})

	// get differences between context object and main instance
	var changes = utils.diff(self, context)
	applyChanges(changes, sealedProps, self)
}

// `Fly extends Emitter`...
util.inherits(Fly, Emitter)
module.exports = Fly

/**
 * Compose a new, yeildable sequence.
 * Resets instance's glob, filters, and writer.
 *
 * @param  {String|Array} globs   The glob selection(s)
 * @param  {Object}       options Any options to pass as `node-glob` config.
 * @return                        The current Fly instance.
 */
Fly.prototype.source = function (globs, options) {
	globs = flatten(arrify(globs))

	assign(this, {
		_: {
			filters: [],
			globs: globs,
			files: Promise.all(globs.map(function (glob) {
				return expand(glob, options)
			}))
		}
	})

	this._.cat = undefined
	_('source %o', this._.globs)
	return this
}

/**
 * Add filter / transform function.
 * Create a closure bound to the current Fly instance.
 *
 * @param {String|Function} name 		The name of filter || the callback
 * @param {Function}        cb      The function: (cb, options) => {}
*/
Fly.prototype.filter = function (name, cb) {
	var type = typeof name

	if (type === 'function') {
		this.filter({cb: name})
	} else if (type === 'object') {
		this._.filters.push(name)
	} else {
		if (typeof this[name] === 'function') {
			throw new RangeError(name + ' method is already defined!')
		}

		this[name] = function (options) {
			var rest = [].slice.call(arguments)
			rest.shift() // remove `options` argument

			debug('fly')(name + ' %o, %o', options, rest)

			return this.filter({
				cb: cb,
				options: options,
				rest: rest
			})
		}
	}

	return this
}

/**
 * Watch IO events within glob selections & run tasks
 * @param  {String} globs   The glob patterns to observe
 * @param  {String} tasks   The list of tasks to run on file changes
 * @param  {Object} options The options for `Fly.proto.start`
 * @return {void}
 */
Fly.prototype.watch = function (globs, tasks, options) {
	options = options || {}
	globs = arrify(globs)

	_('watch %o', globs)

	var self = this
	return self.emit('fly_watch').start(tasks, options).then(function () {
		return chokidar
			.watch(flatten(globs), {ignoreInitial: true})
			.on('all', function (type, file) {
				options.value = null
				self.emit('fly_watch_event', {type: type, file: file})

				// if a single file was passed, then pass in the file to the tasks
				if (path.extname(file)) {
					options.value = file
				}

				return self.start(tasks, options)
			})
			.on('error', self.error)
	})
}

/**
 * Unwrap/Expand source globs as single files, then run fn.
 * @param  {Function} onResolved  The callback to run on 'success'.
 * @param  {Function} onRejected  The callback to run on 'error'.
 * @return {Promise}
 */
Fly.prototype.unwrap = function (onResolved, onRejected) {
	return Promise.resolve(this._.files).then(flatten).then(onResolved).catch(onRejected)
}

/**
 * Execute a single task.
 * @param  {String} task     The name of the task
 * @param  {Mixed}  value    The initial value to pass into `task`
 * @param  {Object} instance The Fly instance `task` should be bound to
 * @return {Mixed}           The task's resulting value.
 */
Fly.prototype.exec = function * (task, value, instance) {
	instance = instance || this
	value = arrify(value)
	_('run %o', task)

	try {
		var start = getTime()

		this.emit('task_start', {
			task: task
		})

		value = (yield this.host[task].apply(instance, value)) || value

		this.emit('task_complete', {
			task: task,
			duration: getTime() - start
		})
	} catch (e) {
		this.emit('task_error', {
			task: task,
			error: e
		})
	}

	return value
}

/**
 * Run a task sequence of 1 or more.
 * Each task's return value is piped into the next task of sequence.
 *
 * @param  {Array}  tasks   The list of tasks to start
 * @param  {Object} options The options to begin.
 * @return {Promise}
 */
Fly.prototype.start = function (tasks, options) {
	tasks = arrify(tasks.length ? tasks : 'default')

	options = assign({
		parallel: false,
		value: null
	}, options || {})

	_('start %o in ' + (options.parallel ? 'parallel' : 'sequence'), tasks)

	var self = this
	var value = options.value
	var inst = Object.create(self)

	return co.call(self, function * (tasks) {
		if (options.parallel) {
			yield tasks.map(function * (task) {
				yield self.exec(task, value, inst)
			})
		} else {
			for (var task of tasks) {
				value = yield self.exec(task, value, inst)
			}
		}
		return value
	}, [].concat(tasks).filter(function (task) {
		return keys(self.host).indexOf(task) !== -1 || !self.emit('task_not_found', {task: task})
	}))
}

/**
 * Deferred `rimraf` wrapper
 * @param  {String|Array} globs  The glob selection(s) to delete
 * @return {void}
 */
Fly.prototype.clear = function (globs) {
	globs = flatten(arrify(globs))

	_('clear %o', globs)

	return globs.map(function (p) {
		return utils.defer(rimraf)(p)
	})
}

/**
 * Concatenate active `files` to single file.
 * @param  {String} filename  The single output file
 * @return {Fly}      				The current Fly instance.
 */
Fly.prototype.concat = function (filename) {
	this._.cat = new Cat(false, filename, '\n')
	this._.cat.base = filename
	return this
}

/**
 * Resolve a yieldable sequence.
 * Reduces `source` with filters and invokes writer.
 *
 * @param  {Array}  dirs    The target/destination directories
 * @param  {Object} options Target options. Depth refers to path retention
 * @return {Promise}
 */
Fly.prototype.target = function (dirs, options) {
	dirs = arrify(dirs)
	options = assign({}, {depth: -1}, options || {})

	var self = this
	var _cat = self._.cat
	var _filters = self._.filters

	return co(function * () {
		var globs = self._.globs
		var files = yield self._.files

		for (var i = 0; i < globs.length; i++) {
			// normalize glob string (for Windows!)
			var glob = globs[i].replace(path.sep, sep)
			// run thru all files of each glob
			yield files[i].map(function * (file) {
				// get data & stats
				var f = path.parse(file)
				var data = yield utils.read(file)

				// had no data (empty file || attempted a directory read)
				if (!data) {
					return // exit
				}

				// pass files' data thru attached filters
				for (var filter of _filters) {
					// run the filter's closure fn w/data
					var res = yield Promise.resolve(filter.cb.apply(
						self, [data, assign({file: f}, filter.options)].concat(filter.rest)
					))

					// once done, retrieve the final `data` & `ext` of output
					data = res.code || res.js || res.css || res.data || res || data
					f.ext = res.ext || res.extension || f.ext
				}

				if (_cat) {
					_cat.add(f.base, data)
				} else {
					var segs = glob.split(sep)
					var wild
					// var wild = segs.findIndex(str => str.includes('*'))
					for (var i = 0; i < segs.length; i++) {
						if (segs[i].indexOf('*') !== -1) {
							wild = i
							break
						}
					}

					// complete the promise & write the output
					yield resolve(dirs, {
						data: data,
						depth: options.depth,
						base: f.dir.split(sep).filter(function (filepath) {
							var idx = segs.indexOf(filepath)
							return idx === -1 || (wild ? (idx >= wild) : idx !== 0)
						}).concat(f.name + f.ext).join(sep)
					})
				}
			})
		}

		if (_cat) {
			yield resolve(dirs, {
				data: _cat.content,
				base: _cat.base,
				depth: options.depth
			})
		}
	})
}

/**
 * Write utility to help concat and target.
 * @param {String}   dirs           parent directory
 * @param {String}   options.base   directory/file
 * @param {Mixed}    options.data
 * @param {Integer}  options.depth  number of parent directories to keep
 * @param {Function} options.write  promisified writer function
 */
function * resolve(dirs, options) {
	var opts = options || {}
	var writer = opts.hasOwnProperty('writer') ? opts.writer : utils.write

	if (opts.depth > -1) {
		opts.base = dirpaths(opts.base, opts.depth)
	}

	yield flatten(dirs).map(function * (dir) {
		var file = path.join(dir, opts.base)
		mkdirp.sync(path.dirname(file))
		yield writer(file, opts.data)
	})
}

/**
 * Shorten a directory string to # of parent dirs
 * @param  {String}  	full    The original full path
 * @param  {Integer}  depth   The number of levels to retain
 * @return {String}
 */
function dirpaths(full, depth) {
	var arr = full.split(sep)
	var len = arr.length

	if (depth === 0) {
		return arr[len - 1]
	} else if (depth >= len) {
		return full
	}

	return arr.slice(len - 1 - depth).join(sep)
}

/**
 * Get the current timestamp
 * @return {Integer}
 */
function getTime() {
	return (new Date()).getTime()
}
