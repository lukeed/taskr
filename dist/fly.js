"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _Symbol$iterator = require("babel-runtime/core-js/symbol/iterator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _rimraf = require("rimraf");

var _rimraf2 = _interopRequireDefault(_rimraf);

var _emitter = require("./emitter");

var _emitter2 = _interopRequireDefault(_emitter);

var _path = require("path");

var _mzFs = require("mz/fs");

var _flyUtil = require("fly-util");

var ENCODING = process.env.ENCODING || "utf8";

var Fly = (function (_Emitter) {
  _inherits(Fly, _Emitter);

  /**
   * Create new instance. Use fly.start(...) to run tasks.
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
    process.chdir(this.root = root);
    this.tasks = {};
    this.host = host instanceof Function ? _Object$assign(host, { "default": host }) : host;
    _Object$assign(this, { log: _flyUtil.log, debug: _flyUtil.debug, warn: _flyUtil.warn, error: _flyUtil.error, defer: _flyUtil.defer });
    _Object$keys(host).forEach(function (task) {
      return _this.tasks[task] = host[task].bind(_this);
    });
    this.plugins = plugins;
    plugins.forEach(function (_) {
      return _.call(_this);
    });
  }

  _createClass(Fly, [{
    key: "source",

    /**
     * Begin a yieldable sequence. Initialize globs, filters and writers.
     * @param {...String} glob patterns
     * @return Fly instance. Promises resolve to { file, source }
     */
    value: function source() {
      for (var _len = arguments.length, globs = Array(_len), _key = 0; _key < _len; _key++) {
        globs[_key] = arguments[_key];
      }

      this._globs = (0, _flyUtil.flatten)(globs);
      this._filters = [];
      this._writers = [];
      return this;
    }
  }, {
    key: "filter",

    /**
     * Add a filter. If name is undefined, extend the prototype with this[name].
     * @param
     *   {String} name of the filter
     *   {Object} { transform, options, ext } object
     *   {Function} transform function
     * @param [{Function}] transform function
     */
    value: function filter(name, transform) {
      var _this2 = this;

      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref2$ext = _ref2.ext;
      var ext = _ref2$ext === undefined ? "" : _ref2$ext;

      if (name instanceof Function) {
        this.filter({ transform: name });
      } else if (typeof name === "object") {
        this._filters.push(name);
      } else {
        if (this[name] instanceof Function) throw new Error(name + " method already defined in instance.");
        this[name] = function (options) {
          return _this2.filter({ transform: transform, options: options, ext: ext });
        };
      }
      return this;
    }
  }, {
    key: "watch",

    /**
    * Watch for IO events in globs and run tasks.
    * @param {[String]} glob patterns to observe for changes
    * @param {[String]} list of tasks to run on changes
    */
    value: function watch(globs, tasks) {
      var _this3 = this;

      this.emit("fly_watch").start(tasks).then(function () {
        return (0, _flyUtil.watch)(_flyUtil.flatten[globs], { ignoreInitial: true }).on("all", function () {
          return _this3.start(tasks);
        });
      });
      return this;
    }
  }, {
    key: "unwrap",

    /**
    * Unwrap source globs.
    * @param {Function} onFulfilled
    * @param {onRejected} onFulfilled
    */
    value: function unwrap(onFulfilled, onRejected) {
      var _this4 = this;

      return new _Promise(function (resolve, reject) {
        _Promise.all(_this4._globs.map(function (glob) {
          return (0, _flyUtil.expand)(glob);
        })).then(function (result) {
          return resolve.apply(_this4, result);
        })["catch"](reject);
      }).then(onFulfilled)["catch"](onRejected);
    }
  }, {
    key: "exec",

    /**
     * @private Execute a single task.
     * @param {String} name of the task
     * @param {Mixed} initial value to pass into the task
     * @param {Object} alternate Fly instance to bind the task with
     */
    value: _regeneratorRuntime.mark(function exec(task, value) {
      var inject = arguments.length <= 2 || arguments[2] === undefined ? this : arguments[2];
      var start;
      return _regeneratorRuntime.wrap(function exec$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.prev = 0;
            start = new Date();

            this.emit("task_start", { task: task });
            context$2$0.next = 5;
            return this.host[task].call(inject, value);

          case 5:
            context$2$0.t0 = context$2$0.sent;

            if (context$2$0.t0) {
              context$2$0.next = 8;
              break;
            }

            context$2$0.t0 = value;

          case 8:
            value = context$2$0.t0;

            this.emit("task_complete", {
              task: task, duration: new Date().getTime() - start
            });
            context$2$0.next = 15;
            break;

          case 12:
            context$2$0.prev = 12;
            context$2$0.t1 = context$2$0["catch"](0);
            this.emit("task_error", { task: task, error: context$2$0.t1 });

          case 15:
            return context$2$0.abrupt("return", value);

          case 16:
          case "end":
            return context$2$0.stop();
        }
      }, exec, this, [[0, 12]]);
    })
  }, {
    key: "start",

    /**
     * Run tasks. Each task's return value cascades on to the next task in
     * a series. Can be yielded inside a task.
     * @param {Array} list of tasks to run
     * @return {Promise}
     */
    value: function start() {
      var _this6 = this;

      var tasks = arguments.length <= 0 || arguments[0] === undefined ? "default" : arguments[0];

      var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref3$parallel = _ref3.parallel;
      var parallel = _ref3$parallel === undefined ? false : _ref3$parallel;
      var value = _ref3.value;

      return _co2["default"].call(this, _regeneratorRuntime.mark(function callee$2$0(tasks) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task;

        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          var _this5 = this;

          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              if (!parallel) {
                context$3$0.next = 5;
                break;
              }

              context$3$0.next = 3;
              return tasks.map(function (task) {
                return _this5.exec(task, value, _Object$create(_this5));
              });

            case 3:
              context$3$0.next = 32;
              break;

            case 5:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              context$3$0.prev = 8;
              _iterator = _getIterator(tasks);

            case 10:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                context$3$0.next = 18;
                break;
              }

              task = _step.value;
              context$3$0.next = 14;
              return this.exec(task, value);

            case 14:
              value = context$3$0.sent;

            case 15:
              _iteratorNormalCompletion = true;
              context$3$0.next = 10;
              break;

            case 18:
              context$3$0.next = 24;
              break;

            case 20:
              context$3$0.prev = 20;
              context$3$0.t0 = context$3$0["catch"](8);
              _didIteratorError = true;
              _iteratorError = context$3$0.t0;

            case 24:
              context$3$0.prev = 24;
              context$3$0.prev = 25;

              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }

            case 27:
              context$3$0.prev = 27;

              if (!_didIteratorError) {
                context$3$0.next = 30;
                break;
              }

              throw _iteratorError;

            case 30:
              return context$3$0.finish(27);

            case 31:
              return context$3$0.finish(24);

            case 32:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[8, 20, 24, 32], [25,, 27, 31]]);
      }), [].concat(tasks).filter(function (task) {
        return ~_Object$keys(_this6.host).indexOf(task) || !_this6.emit("task_not_found", { task: task });
      }));
    }
  }, {
    key: "write",

    /**
     * Add a writer function to the collection of writers.
     * @param {Generator} function yielding a promise
     */
    value: function write(writer) {
      this._writers.push(writer.bind(this));
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
     * Concat read globs into one or more files.
     * @param {[String]} array of name of target files
     */
    value: function concat(name) {
      this.write(_regeneratorRuntime.mark(function callee$2$0(_ref4) {
        var path = _ref4.path;
        var source = _ref4.source;
        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              // @TODO: by default this operation should clear the target file to concat
              _mkdirp2["default"].sync(path);
              context$3$0.next = 3;
              return (0, _mzFs.appendFile)((0, _path.join)(path, name), source, ENCODING);

            case 3:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this);
      }));
      return this;
    }
  }, {
    key: "target",

    /**
     * Resolve a yieldable sequence. Reduce source applying available filters.
     * @param {Array} destination paths
     */
    value: function target() {
      for (var _len3 = arguments.length, dest = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        dest[_key3] = arguments[_key3];
      }

      if (this._writers.length === 0) {
        this.write(_regeneratorRuntime.mark(function callee$2$0(_ref5) {
          var target = _ref5.target;
          var source = _ref5.source;
          return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                _mkdirp2["default"].sync((0, _path.dirname)(target));
                context$3$0.next = 3;
                return (0, _mzFs.writeFile)(target, source, ENCODING);

              case 3:
              case "end":
                return context$3$0.stop();
            }
          }, callee$2$0, this);
        }));
      }
      return _co2["default"].call(this, _regeneratorRuntime.mark(function callee$2$0() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, glob, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, file, output, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, path, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, write;

        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              context$3$0.prev = 3;
              _iterator2 = _getIterator(this._globs);

            case 5:
              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                context$3$0.next = 99;
                break;
              }

              glob = _step2.value;
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              context$3$0.prev = 10;
              context$3$0.next = 13;
              return (0, _flyUtil.expand)(glob);

            case 13:
              context$3$0.t0 = _Symbol$iterator;
              _iterator3 = context$3$0.sent[context$3$0.t0]();

            case 15:
              if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                context$3$0.next = 82;
                break;
              }

              file = _step3.value;
              context$3$0.t1 = _regeneratorRuntime.mark(function reduce(file, filters) {
                var filter;
                return _regeneratorRuntime.wrap(function reduce$(context$4$0) {
                  while (1) switch (context$4$0.prev = context$4$0.next) {
                    case 0:
                      filter = filters[0];

                      if (!(filters.length === 0)) {
                        context$4$0.next = 5;
                        break;
                      }

                      context$4$0.t0 = file;
                      context$4$0.next = 16;
                      break;

                    case 5:
                      context$4$0.t1 = reduce;
                      context$4$0.t2 = this;
                      context$4$0.next = 9;
                      return _Promise.resolve(filter.transform.call(this, file.source, filter.options));

                    case 9:
                      context$4$0.t3 = context$4$0.sent;
                      context$4$0.t4 = filter.ext ? filter.ext : file.ext;
                      context$4$0.t5 = {
                        source: context$4$0.t3,
                        ext: context$4$0.t4
                      };
                      context$4$0.t6 = filters.slice(1);
                      context$4$0.next = 15;
                      return context$4$0.t1.call.call(context$4$0.t1, context$4$0.t2, context$4$0.t5, context$4$0.t6);

                    case 15:
                      context$4$0.t0 = context$4$0.sent;

                    case 16:
                      return context$4$0.abrupt("return", context$4$0.t0);

                    case 17:
                    case "end":
                      return context$4$0.stop();
                  }
                }, reduce, this);
              });
              context$3$0.t2 = this;
              context$3$0.next = 21;
              return (0, _mzFs.readFile)(file);

            case 21:
              context$3$0.t3 = context$3$0.sent;
              context$3$0.t4 = "" + context$3$0.t3;
              context$3$0.t5 = (0, _path.parse)(file).ext;
              context$3$0.t6 = {
                source: context$3$0.t4,
                ext: context$3$0.t5
              };
              context$3$0.t7 = this._filters;
              context$3$0.next = 28;
              return context$3$0.t1.call.call(context$3$0.t1, context$3$0.t2, context$3$0.t6, context$3$0.t7);

            case 28:
              output = context$3$0.sent;
              _iteratorNormalCompletion4 = true;
              _didIteratorError4 = false;
              _iteratorError4 = undefined;
              context$3$0.prev = 32;
              _iterator4 = _getIterator((0, _flyUtil.flatten)(dest));

            case 34:
              if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                context$3$0.next = 65;
                break;
              }

              path = _step4.value;
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              context$3$0.prev = 39;
              _iterator5 = _getIterator(this._writers);

            case 41:
              if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                context$3$0.next = 48;
                break;
              }

              write = _step5.value;
              context$3$0.next = 45;
              return write({
                path: path, source: output.source,
                target: (0, _path.join)(path, "" + (0, _path.parse)(file).name + output.ext)
              });

            case 45:
              _iteratorNormalCompletion5 = true;
              context$3$0.next = 41;
              break;

            case 48:
              context$3$0.next = 54;
              break;

            case 50:
              context$3$0.prev = 50;
              context$3$0.t8 = context$3$0["catch"](39);
              _didIteratorError5 = true;
              _iteratorError5 = context$3$0.t8;

            case 54:
              context$3$0.prev = 54;
              context$3$0.prev = 55;

              if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                _iterator5["return"]();
              }

            case 57:
              context$3$0.prev = 57;

              if (!_didIteratorError5) {
                context$3$0.next = 60;
                break;
              }

              throw _iteratorError5;

            case 60:
              return context$3$0.finish(57);

            case 61:
              return context$3$0.finish(54);

            case 62:
              _iteratorNormalCompletion4 = true;
              context$3$0.next = 34;
              break;

            case 65:
              context$3$0.next = 71;
              break;

            case 67:
              context$3$0.prev = 67;
              context$3$0.t9 = context$3$0["catch"](32);
              _didIteratorError4 = true;
              _iteratorError4 = context$3$0.t9;

            case 71:
              context$3$0.prev = 71;
              context$3$0.prev = 72;

              if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                _iterator4["return"]();
              }

            case 74:
              context$3$0.prev = 74;

              if (!_didIteratorError4) {
                context$3$0.next = 77;
                break;
              }

              throw _iteratorError4;

            case 77:
              return context$3$0.finish(74);

            case 78:
              return context$3$0.finish(71);

            case 79:
              _iteratorNormalCompletion3 = true;
              context$3$0.next = 15;
              break;

            case 82:
              context$3$0.next = 88;
              break;

            case 84:
              context$3$0.prev = 84;
              context$3$0.t10 = context$3$0["catch"](10);
              _didIteratorError3 = true;
              _iteratorError3 = context$3$0.t10;

            case 88:
              context$3$0.prev = 88;
              context$3$0.prev = 89;

              if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                _iterator3["return"]();
              }

            case 91:
              context$3$0.prev = 91;

              if (!_didIteratorError3) {
                context$3$0.next = 94;
                break;
              }

              throw _iteratorError3;

            case 94:
              return context$3$0.finish(91);

            case 95:
              return context$3$0.finish(88);

            case 96:
              _iteratorNormalCompletion2 = true;
              context$3$0.next = 5;
              break;

            case 99:
              context$3$0.next = 105;
              break;

            case 101:
              context$3$0.prev = 101;
              context$3$0.t11 = context$3$0["catch"](3);
              _didIteratorError2 = true;
              _iteratorError2 = context$3$0.t11;

            case 105:
              context$3$0.prev = 105;
              context$3$0.prev = 106;

              if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                _iterator2["return"]();
              }

            case 108:
              context$3$0.prev = 108;

              if (!_didIteratorError2) {
                context$3$0.next = 111;
                break;
              }

              throw _iteratorError2;

            case 111:
              return context$3$0.finish(108);

            case 112:
              return context$3$0.finish(105);

            case 113:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[3, 101, 105, 113], [10, 84, 88, 96], [32, 67, 71, 79], [39, 50, 54, 62], [55,, 57, 61], [72,, 74, 78], [89,, 91, 95], [106,, 108, 112]]);
      }));
    }
  }]);

  return Fly;
})(_emitter2["default"]);

exports["default"] = Fly;
module.exports = exports["default"];