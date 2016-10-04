/*eslint-disable */
// /**
//  * Watch IO events within glob selections & run tasks
//  * @param  {String} globs   The glob patterns to observe
//  * @param  {String} tasks   The list of tasks to run on file changes
//  * @param  {Object} options The options for `Fly.proto.start`
//  * @return {void}
//  */
// Fly.prototype.watch = function (globs, tasks, options) {
// 	options = options || {}
// 	globs = arrify(globs)

// 	_('watch %o', globs)

// 	var self = this
// 	return self.emit('fly_watch').start(tasks, options).then(function () {
// 		return chokidar
// 			.watch(flatten(globs), {ignoreInitial: true})
// 			.on('all', function (type, file) {
// 				options.value = null
// 				self.emit('fly_watch_event', {type: type, file: file})

// 				// if a single file was passed, then pass in the file to the tasks
// 				if (path.extname(file)) {
// 					options.value = file
// 				}

// 				return self.start(tasks, options)
// 			})
// 			.on('error', self.error)
// 	})
// }

// /**
//  * Resolve a yieldable sequence.
//  * Reduces `source` with filters and invokes writer.
//  *
//  * @param  {Array}  dirs    The target/destination directories
//  * @param  {Object} options Target options. Depth refers to path retention
//  * @return {Promise}
//  */
// Fly.prototype.target = function (dirs, options) {
// 	dirs = arrify(dirs)
// 	options = assign({}, {depth: -1}, options || {})

// 	var self = this
// 	var _cat = self._.cat
// 	var _filters = self._.filters

// 	return co(function * () {
// 		var globs = self._.globs
// 		var files = yield self._.files

// 		for (var i = 0; i < globs.length; i++) {
// 			var glob = globs[i]
// 			// run thru all files of each glob
// 			yield files[i].map(function * (file) {
// 				// get data & stats
// 				var f = path.parse(file)
// 				var data = yield $.read(file)

// 				// had no data (empty file || attempted a directory read)
// 				if (!data) {
// 					return // exit
// 				}

// 				// pass files' data thru attached filters
// 				for (var filter of _filters) {
// 					// run the filter's closure fn w/data
// 					var res = yield Promise.resolve(filter.cb.apply(
// 						self, [data, assign({file: f}, filter.options)].concat(filter.rest)
// 					))

// 					// once done, retrieve the final `data` & `ext` of output
// 					data = res.code || res.js || res.css || res.data || res || data
// 					f.ext = res.ext || res.extension || f.ext
// 				}

// 				if (_cat) {
// 					_cat.add(f.base, data)
// 				} else {
// 					// complete the promise & write the output
// 					yield resolve(dirs, {
// 						data: data,
// 						depth: options.depth,
// 						base: f.dir.split(sep).filter(function (filepath) {
// 							return glob.split(sep).indexOf(filepath) === -1
// 						}).concat(f.name + f.ext).join(sep)
// 					})
// 				}
// 			})
// 		}

// 		if (_cat) {
// 			yield resolve(dirs, {
// 				data: _cat.content,
// 				base: _cat.base,
// 				depth: options.depth
// 			})
// 		}
// 	})
// }

// /**
//  * Write utility to help concat and target.
//  * @param {String}   dirs           parent directory
//  * @param {String}   options.base   directory/file
//  * @param {Mixed}    options.data
//  * @param {Integer}  options.depth  number of parent directories to keep
//  * @param {Function} options.write  promisified writer function
//  */
// function * resolve(dirs, options) {
// 	var opts = options || {}
// 	var writer = opts.hasOwnProperty('writer') ? opts.writer : $.write

// 	if (opts.depth > -1) {
// 		opts.base = dirpaths(opts.base, opts.depth)
// 	}

// 	yield flatten(dirs).map(function * (dir) {
// 		var file = path.join(dir, opts.base)
// 		mkdirp.sync(path.dirname(file))
// 		yield writer(file, opts.data)
// 	})
// }

// /**
//  * Shorten a directory string to # of parent dirs
//  * @param  {String}  	full    The original full path
//  * @param  {Integer}  depth   The number of levels to retain
//  * @return {String}
//  */
// function dirpaths(full, depth) {
// 	var arr = full.split(sep)
// 	var len = arr.length

// 	if (depth === 0) {
// 		return arr[len - 1]
// 	} else if (depth >= len) {
// 		return full
// 	}

// 	return arr.slice(len - 1 - depth).join(sep)
// }
