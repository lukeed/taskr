"use strict";

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

var _Symbol$iterator = require("babel-runtime/core-js/symbol/iterator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _mzFs = require("mz/fs");

var _mzFs2 = _interopRequireDefault(_mzFs);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _rimraf = require("rimraf");

var _rimraf2 = _interopRequireDefault(_rimraf);

var _path = require("path");

var _emitter = require("./emitter");

var _emitter2 = _interopRequireDefault(_emitter);

var _fmt = require("./fmt");

var _fmt2 = _interopRequireDefault(_fmt);

var _flyUtil = require("fly-util");

var _ = _interopRequireWildcard(_flyUtil);

var Fly = (function (_Emitter) {
  /**
   * Create a new instance of Fly. Use fly.start(...) to run tasks.
   * @param {Object} Flyfile, also known as host
   * @param {String} relative base path / root
   * @param {Array} list of plugins to load.
   */

  function Fly(_ref) {
    var _this = this;

    var host = _ref.host;
    var _ref$root = _ref.root;
    var root = _ref$root === undefined ? "./" : _ref$root;
    var _ref$plugins = _ref.plugins;
    var plugins = _ref$plugins === undefined ? [] : _ref$plugins;

    _classCallCheck(this, Fly);

    _get(Object.getPrototypeOf(Fly.prototype), "constructor", this).call(this);
    this.defer = _.defer;
    this.encoding = process.env.ENCODING || "utf8";
    this.host = this.tasks = host instanceof Function ? _Object$assign(host, { "default": host }) : host;

    _Object$keys(host).forEach(function (task) {
      return _this.tasks[task] = _this.host[task] = host[task].bind(_this);
    });

    process.chdir(this.root = root);
    plugins.forEach(function (plugin) {
      return plugin.call(_this);
    });
  }

  _inherits(Fly, _Emitter);

  _createClass(Fly, [{
    key: "log",

    /**
     * Log a message with a time stamp.
     */
    value: function log() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _.log("[" + _fmt2["default"].time + "] " + args);
      return this;
    }
  }, {
    key: "clear",

    /**
     * Rimraf paths.
     * @param {...String} paths
     */
    value: function clear() {
      var _clear = this.defer(_rimraf2["default"]);

      for (var _len2 = arguments.length, paths = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        paths[_key2] = arguments[_key2];
      }

      return paths.map(function (path) {
        return _clear(path);
      });
    }
  }, {
    key: "concat",

    /**
     * Concatenates files read via source.
     * @param {String} name of the concatenated file
     * @TODO: by default this operation should clear the target file to concat
     */
    value: function concat(name) {
      this.write(_regeneratorRuntime.mark(function callee$2$0(_ref2) {
        var path = _ref2.path;
        var source = _ref2.source;
        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              _mkdirp2["default"].sync(path);
              context$3$0.next = 3;
              return _mzFs2["default"].appendFile((0, _path.join)(path, name), source, this.encoding);

            case 3:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this);
      }));
      return this;
    }
  }, {
    key: "write",

    /**
     * Append a writer to be applied after the globs are expanded and sources
     * read. Examples of writers are the default IO writer and concat.
     * @param {Generator} function yielding a promise.
     */
    value: function write(writer) {
      this._writers.push(writer.bind(this));
      return this;
    }
  }, {
    key: "filter",

    /**
     * Add a transformer filter. If specified by name and Fly.prototype[name]
     * is undefined, extends prototype with a method closing on filter.
     * @param
     *   {String} name of the filter.
     *   {Object} { filter, options } object.
     *   {Function} filter function.
     * @param [{Function}] filter function.
     */
    value: function filter(name, _filter) {
      var _this2 = this;

      var _ref3 = arguments[2] === undefined ? {} : arguments[2];

      var _ref3$ext = _ref3.ext;
      var ext = _ref3$ext === undefined ? "" : _ref3$ext;

      if (name instanceof Function) {
        this.filter({ filter: name });
      } else if (typeof name === "object") {
        this._filters.push(name);
      } else {
        if (this[name] instanceof Function) throw new Error(name + " method already defined in instance.");
        this[name] = function (options) {
          return _this2.filter({ filter: _filter, options: options, ext: ext });
        };
      }
      return this;
    }
  }, {
    key: "watch",

    /**
     * Watch for IO events in globs and run tasks.
     * @param {Array:String} glob patterns to observe for changes
     * @param {Array:String} list of tasks to run on changes
     */
    value: function watch(globs, tasks) {
      var _this3 = this;

      this.notify("fly_watch").start(tasks).then(function () {
        return _.watch(globs, { ignoreInitial: true }).on("all", function () {
          return _this3.start(tasks);
        });
      });
      return this;
    }
  }, {
    key: "start",

    /**
     * Run tasks. Each task's return value cascades on to the next task in
     * a series. Can be yielded inside a task.
     * @param {Array} list of tasks to run
     * @return {Promise}
     */
    value: function start() {
      var tasks = arguments[0] === undefined ? [] : arguments[0];

      if (tasks.length === 0) tasks.push("default");
      return _co2["default"].call(this, _regeneratorRuntime.mark(function callee$2$0(ret) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task, start;

        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          var _this4 = this;

          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              context$3$0.prev = 3;
              _iterator = _getIterator([].concat(tasks).filter(function (task) {
                return ~_Object$keys(_this4.host).indexOf(task) || !_this4.notify("task_not_found", { task: task });
              }));

            case 5:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                context$3$0.next = 22;
                break;
              }

              task = _step.value;
              start = new Date();

              this.notify("task_start", { task: task });
              context$3$0.prev = 9;
              context$3$0.next = 12;
              return this.tasks[task].call(this, ret);

            case 12:
              ret = context$3$0.sent;

              this.notify("task_complete", {
                task: task, duration: new Date().getTime() - start
              });
              context$3$0.next = 19;
              break;

            case 16:
              context$3$0.prev = 16;
              context$3$0.t0 = context$3$0["catch"](9);
              this.notify("task_error", { task: task, error: context$3$0.t0 });

            case 19:
              _iteratorNormalCompletion = true;
              context$3$0.next = 5;
              break;

            case 22:
              context$3$0.next = 28;
              break;

            case 24:
              context$3$0.prev = 24;
              context$3$0.t1 = context$3$0["catch"](3);
              _didIteratorError = true;
              _iteratorError = context$3$0.t1;

            case 28:
              context$3$0.prev = 28;
              context$3$0.prev = 29;

              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }

            case 31:
              context$3$0.prev = 31;

              if (!_didIteratorError) {
                context$3$0.next = 34;
                break;
              }

              throw _iteratorError;

            case 34:
              return context$3$0.finish(31);

            case 35:
              return context$3$0.finish(28);

            case 36:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[3, 24, 28, 36], [9, 16], [29,, 31, 35]]);
      }));
    }
  }, {
    key: "source",

    /**
     * Compose a yieldable sequence. Initialize globs, filters and writers.
     * @param {...String} glob patterns
     * @return Fly instance. Promises resolve to { file, source }
     */
    value: function source() {
      for (var _len3 = arguments.length, globs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        globs[_key3] = arguments[_key3];
      }

      this._globs = _.flatten(globs);
      this._filters = [];
      this._writers = [];
      return this;
    }
  }, {
    key: "unwrap",

    /**
     * Unwrap the source globs.
     * @param {Function} onFulfilled
     * @param {onRejected} onFulfilled
     */
    value: function unwrap(onFulfilled, onRejected) {
      var _this5 = this;

      return new _Promise(function (resolve, reject) {
        _Promise.all(_this5._globs.map(function (glob) {
          return _.expand(glob);
        })).then(function (result) {
          return resolve.apply(_this5, result);
        })["catch"](reject);
      }).then(onFulfilled)["catch"](onRejected);
    }
  }, {
    key: "target",

    /**
     * Yield expanded glob promises and filter-reduce sources.
     * @param {Array} destination paths
     * @param {Boolean} apply filters to each glob pattern in parallel
     */
    value: _regeneratorRuntime.mark(function target(dest) {
      var _ref4,
          _ref4$parallel,
          parallel,
          go,
          _iteratorNormalCompletion4,
          _didIteratorError4,
          _iteratorError4,
          _iterator4,
          _step4,
          glob,
          args$2$0 = arguments;

      return _regeneratorRuntime.wrap(function target$(context$2$0) {
        var _this8 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _ref4 = args$2$0[1] === undefined ? {} : args$2$0[1];
            _ref4$parallel = _ref4.parallel;
            parallel = _ref4$parallel === undefined ? false : _ref4$parallel;

            go = function go(glob, dest) {
              var base = (function (_) {
                return _.length ? "" : _.shift();
              })(glob.split("*"));
              return _regeneratorRuntime.mark(function callee$3$0() {
                var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2;

                return _regeneratorRuntime.wrap(function callee$3$0$(context$4$0) {
                  var _this7 = this;

                  while (1) switch (context$4$0.prev = context$4$0.next) {
                    case 0:
                      _iteratorNormalCompletion2 = true;
                      _didIteratorError2 = false;
                      _iteratorError2 = undefined;
                      context$4$0.prev = 3;
                      _loop = _regeneratorRuntime.mark(function callee$4$0() {
                        var file;
                        return _regeneratorRuntime.wrap(function callee$4$0$(context$5$0) {
                          while (1) switch (context$5$0.prev = context$5$0.next) {
                            case 0:
                              file = _step2.value;
                              context$5$0.t0 = _regeneratorRuntime.mark(function reduce(source, filters) {
                                var ext = arguments[2] === undefined ? "" : arguments[2];

                                var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _loop2, _iterator3, _step3, _2;

                                return _regeneratorRuntime.wrap(function reduce$(context$6$0) {
                                  var _this6 = this;

                                  while (1) switch (context$6$0.prev = context$6$0.next) {
                                    case 0:
                                      if (!(filters.length === 0)) {
                                        context$6$0.next = 28;
                                        break;
                                      }

                                      _iteratorNormalCompletion3 = true;
                                      _didIteratorError3 = false;
                                      _iteratorError3 = undefined;
                                      context$6$0.prev = 4;
                                      _loop2 = _regeneratorRuntime.mark(function callee$6$0() {
                                        var path, target;
                                        return _regeneratorRuntime.wrap(function callee$6$0$(context$7$0) {
                                          while (1) switch (context$7$0.prev = context$7$0.next) {
                                            case 0:
                                              path = _step3.value;

                                              target = (function (file) {
                                                return (0, _path.join)(path, "" + file.name + (ext ? ext : file.ext));
                                              })((0, _path.parse)(file));

                                              if (!this._writers.length) {
                                                this.write(_regeneratorRuntime.mark(function callee$7$0(_ref5) {
                                                  var target = _ref5.target;
                                                  var source = _ref5.source;
                                                  return _regeneratorRuntime.wrap(function callee$7$0$(context$8$0) {
                                                    while (1) switch (context$8$0.prev = context$8$0.next) {
                                                      case 0:
                                                        _mkdirp2["default"].sync((0, _path.dirname)(target));context$8$0.next = 3;
                                                        return _mzFs2["default"].writeFile(target, source, this.encoding);

                                                      case 3:
                                                      case "end":
                                                        return context$8$0.stop();
                                                    }
                                                  }, callee$7$0, this);
                                                }));
                                              }
                                              context$7$0.next = 5;
                                              return this._writers.map(function (write) {
                                                return write({ path: path, target: target, base: base, file: file, source: source });
                                              });

                                            case 5:
                                            case "end":
                                              return context$7$0.stop();
                                          }
                                        }, callee$6$0, _this6);
                                      });
                                      _iterator3 = _getIterator(dest);

                                    case 7:
                                      if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                        context$6$0.next = 12;
                                        break;
                                      }

                                      return context$6$0.delegateYield(_loop2(), "t0", 9);

                                    case 9:
                                      _iteratorNormalCompletion3 = true;
                                      context$6$0.next = 7;
                                      break;

                                    case 12:
                                      context$6$0.next = 18;
                                      break;

                                    case 14:
                                      context$6$0.prev = 14;
                                      context$6$0.t1 = context$6$0["catch"](4);
                                      _didIteratorError3 = true;
                                      _iteratorError3 = context$6$0.t1;

                                    case 18:
                                      context$6$0.prev = 18;
                                      context$6$0.prev = 19;

                                      if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                        _iterator3["return"]();
                                      }

                                    case 21:
                                      context$6$0.prev = 21;

                                      if (!_didIteratorError3) {
                                        context$6$0.next = 24;
                                        break;
                                      }

                                      throw _iteratorError3;

                                    case 24:
                                      return context$6$0.finish(21);

                                    case 25:
                                      return context$6$0.finish(18);

                                    case 26:
                                      context$6$0.next = 31;
                                      break;

                                    case 28:
                                      _2 = filters[0];
                                      context$6$0.next = 31;
                                      return _regeneratorRuntime.mark(function callee$6$0(filter, ext) {
                                        return _regeneratorRuntime.wrap(function callee$6$0$(context$7$0) {
                                          while (1) switch (context$7$0.prev = context$7$0.next) {
                                            case 0:
                                              context$7$0.t0 = reduce;
                                              context$7$0.t1 = this;

                                              if (!(filter instanceof _Promise)) {
                                                context$7$0.next = 8;
                                                break;
                                              }

                                              context$7$0.next = 5;
                                              return filter;

                                            case 5:
                                              context$7$0.t2 = context$7$0.sent;
                                              context$7$0.next = 9;
                                              break;

                                            case 8:
                                              context$7$0.t2 = filter;

                                            case 9:
                                              context$7$0.t3 = context$7$0.t2;
                                              context$7$0.t4 = filters.slice(1);
                                              context$7$0.t5 = ext;
                                              context$7$0.next = 14;
                                              return context$7$0.t0.call.call(context$7$0.t0, context$7$0.t1, context$7$0.t3, context$7$0.t4, context$7$0.t5);

                                            case 14:
                                            case "end":
                                              return context$7$0.stop();
                                          }
                                        }, callee$6$0, this);
                                      }).call(this, _2.filter.apply(this, [source, _2.options]), _2.ext);

                                    case 31:
                                    case "end":
                                      return context$6$0.stop();
                                  }
                                }, reduce, this, [[4, 14, 18, 26], [19,, 21, 25]]);
                              });
                              context$5$0.t1 = this;
                              context$5$0.next = 5;
                              return _mzFs2["default"].readFile(file);

                            case 5:
                              context$5$0.t2 = context$5$0.sent;
                              context$5$0.t3 = "" + context$5$0.t2;
                              context$5$0.t4 = this._filters;
                              context$5$0.next = 10;
                              return context$5$0.t0.call.call(context$5$0.t0, context$5$0.t1, context$5$0.t3, context$5$0.t4);

                            case 10:
                            case "end":
                              return context$5$0.stop();
                          }
                        }, callee$4$0, _this7);
                      });
                      context$4$0.next = 7;
                      return _.expand(glob);

                    case 7:
                      context$4$0.t0 = _Symbol$iterator;
                      _iterator2 = context$4$0.sent[context$4$0.t0]();

                    case 9:
                      if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                        context$4$0.next = 14;
                        break;
                      }

                      return context$4$0.delegateYield(_loop(), "t1", 11);

                    case 11:
                      _iteratorNormalCompletion2 = true;
                      context$4$0.next = 9;
                      break;

                    case 14:
                      context$4$0.next = 20;
                      break;

                    case 16:
                      context$4$0.prev = 16;
                      context$4$0.t2 = context$4$0["catch"](3);
                      _didIteratorError2 = true;
                      _iteratorError2 = context$4$0.t2;

                    case 20:
                      context$4$0.prev = 20;
                      context$4$0.prev = 21;

                      if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                      }

                    case 23:
                      context$4$0.prev = 23;

                      if (!_didIteratorError2) {
                        context$4$0.next = 26;
                        break;
                      }

                      throw _iteratorError2;

                    case 26:
                      return context$4$0.finish(23);

                    case 27:
                      return context$4$0.finish(20);

                    case 28:
                    case "end":
                      return context$4$0.stop();
                  }
                }, callee$3$0, this, [[3, 16, 20, 28], [21,, 23, 27]]);
              }).call(_this8);
            };

            if (!parallel) {
              context$2$0.next = 9;
              break;
            }

            context$2$0.next = 7;
            return this._globs.map(function (glob) {
              return go(glob, _.flatten(dest));
            });

          case 7:
            context$2$0.next = 35;
            break;

          case 9:
            _iteratorNormalCompletion4 = true;
            _didIteratorError4 = false;
            _iteratorError4 = undefined;
            context$2$0.prev = 12;
            _iterator4 = _getIterator(this._globs);

          case 14:
            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
              context$2$0.next = 21;
              break;
            }

            glob = _step4.value;
            context$2$0.next = 18;
            return go(glob, _.flatten(Array.isArray(dest) ? dest : [dest]));

          case 18:
            _iteratorNormalCompletion4 = true;
            context$2$0.next = 14;
            break;

          case 21:
            context$2$0.next = 27;
            break;

          case 23:
            context$2$0.prev = 23;
            context$2$0.t0 = context$2$0["catch"](12);
            _didIteratorError4 = true;
            _iteratorError4 = context$2$0.t0;

          case 27:
            context$2$0.prev = 27;
            context$2$0.prev = 28;

            if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
              _iterator4["return"]();
            }

          case 30:
            context$2$0.prev = 30;

            if (!_didIteratorError4) {
              context$2$0.next = 33;
              break;
            }

            throw _iteratorError4;

          case 33:
            return context$2$0.finish(30);

          case 34:
            return context$2$0.finish(27);

          case 35:
          case "end":
            return context$2$0.stop();
        }
      }, target, this, [[12, 23, 27, 35], [28,, 30, 34]]);
    })
  }]);

  return Fly;
})(_emitter2["default"]);

exports["default"] = Fly;
module.exports = exports["default"];
// TODO cache?