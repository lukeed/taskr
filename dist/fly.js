"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _toConsumableArray = require("babel-runtime/helpers/to-consumable-array")["default"];

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

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _rimraf = require("rimraf");

var _rimraf2 = _interopRequireDefault(_rimraf);

var _chokidar = require("chokidar");

var _chokidar2 = _interopRequireDefault(_chokidar);

var _emitter = require("./emitter");

var _emitter2 = _interopRequireDefault(_emitter);

var _path = require("path");

var _mzFs = require("mz/fs");

var _flyUtil = require("fly-util");

var _ = (0, _debug2["default"])("fly");

var Fly = (function (_Emitter) {
  _inherits(Fly, _Emitter);

  /**
    Create a new Fly instance.
    @param {String} path to the flyfile
    @param {Object} loaded flyfile
    @param {[Function]} plugins
  */

  function Fly() {
    var _this = this;

    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$file = _ref.file;
    var file = _ref$file === undefined ? "." : _ref$file;
    var _ref$host = _ref.host;
    var host = _ref$host === undefined ? {} : _ref$host;
    var _ref$plugins = _ref.plugins;
    var plugins = _ref$plugins === undefined ? [] : _ref$plugins;

    _classCallCheck(this, Fly);

    _get(Object.getPrototypeOf(Fly.prototype), "constructor", this).call(this);

    _("init ✈");
    this.debug = _;
    this.tasks = {};
    this._filters = [];
    this._writers = [];
    this.encoding = process.env.ENCODING || "utf8";

    this.host = host instanceof Function ? _Object$assign(host, { "default": host }) : host;

    _Object$assign(this, { log: _flyUtil.log, alert: _flyUtil.alert, error: _flyUtil.error, defer: _flyUtil.defer, plugins: plugins });

    _Object$keys(host).forEach(function (task) {
      return _this.tasks[task] = host[task].bind(_this);
    });

    _("load %o", plugins);
    this.plugins = plugins;
    plugins.forEach(function (_ref2) {
      var name = _ref2.name;
      var plugin = _ref2.plugin;
      return plugin.call(_this, (0, _debug2["default"])(name.replace("-", ":")));
    });

    this.root = (0, _path.dirname)(file);
    process.chdir((0, _path.dirname)(this.file = file));
    _("switch to %o", process.cwd());
  }

  /**
    Use to compose a yieldable sequence.
    Reset globs, filters and writers.
    @param {...String} glob patterns
    @return Fly instance. Promises resolve to { file, source }
   */

  _createClass(Fly, [{
    key: "source",
    value: function source() {
      for (var _len = arguments.length, globs = Array(_len), _key = 0; _key < _len; _key++) {
        globs[_key] = arguments[_key];
      }

      _("source %o", globs);
      this._globs = (0, _flyUtil.flatten)(globs);
      this._filters = [];
      this._writers = [];
      return this;
    }

    /**
      Add a filter. If name is undefined, inject this[name].
      @param
        {String} name of the filter
        {Object} { transform, options, ext } object
        {Function} transform function
      @param [{Function}] transform function
    */
  }, {
    key: "filter",
    value: function filter(name, transform) {
      var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref3$ext = _ref3.ext;
      var ext = _ref3$ext === undefined ? "" : _ref3$ext;

      if (name instanceof Function) {
        this.filter({ transform: name });
      } else if (typeof name === "object") {
        this._filters.push(name);
      } else {
        if (this[name] instanceof Function) throw new Error(name + " method already defined in instance.");
        this[name] = function (options) {
          return this.filter({ transform: transform, options: options, ext: ext });
        };
      }
      return this;
    }

    /**
      Watch for IO events in globs and run tasks.
      @param {[String]} glob patterns to observe for changes
      @param {[String]} list of tasks to run on changes
      @param {Object} start options. See Fly.proto.start
    */
  }, {
    key: "watch",
    value: function watch(globs, tasks, options) {
      var _this2 = this;

      _("watch %o", globs);
      return this.emit("fly_watch").start(tasks, options).then(function () {
        return _chokidar2["default"].watch((0, _flyUtil.flatten)([globs]), { ignoreInitial: true }).on("all", function () {
          return _this2.start(tasks, options);
        });
      });
    }

    /**
      Unwrap source globs.
      @param {Function} onFulfilled
      @param {onRejected} onFulfilled
    */
  }, {
    key: "unwrap",
    value: function unwrap(onFulfilled, onRejected) {
      var _this3 = this;

      _("unwrap %o", this._globs);
      return new _Promise(function (resolve, reject) {
        //return
        _Promise.all(_this3._globs.map(function (glob) {
          return (0, _flyUtil.expand)(glob);
        })).then(function (result) {
          _("%o", result);
          _("unwrap ✔");
          return resolve.apply(_this3, result);
        })["catch"](reject);
      }).then(onFulfilled)["catch"](onRejected);
    }

    /**
      @private Execute a single task.
      @param {String} name of the task
      @param {Mixed} initial value to pass into the task
      @param {Object} Fly instance the task should be bound to
    */
  }, {
    key: "exec",
    value: _regeneratorRuntime.mark(function exec(task, value) {
      var inject = arguments.length <= 2 || arguments[2] === undefined ? this : arguments[2];
      var start;
      return _regeneratorRuntime.wrap(function exec$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _("run %o", task);
            context$2$0.prev = 1;
            start = new Date();

            this.emit("task_start", { task: task });
            context$2$0.next = 6;
            return this.host[task].call(inject, value);

          case 6:
            context$2$0.t0 = context$2$0.sent;

            if (context$2$0.t0) {
              context$2$0.next = 9;
              break;
            }

            context$2$0.t0 = value;

          case 9:
            value = context$2$0.t0;

            this.emit("task_complete", {
              task: task, duration: new Date().getTime() - start
            });
            context$2$0.next = 16;
            break;

          case 13:
            context$2$0.prev = 13;
            context$2$0.t1 = context$2$0["catch"](1);
            this.emit("task_error", { task: task, error: context$2$0.t1 });

          case 16:
            return context$2$0.abrupt("return", value);

          case 17:
          case "end":
            return context$2$0.stop();
        }
      }, exec, this, [[1, 13]]);
    })

    /**
      Run one or more tasks. Each task's return value cascades on to
      the next task in a series.
      @param {Array} list of tasks
      @return {Promise}
     */
  }, {
    key: "start",
    value: function start() {
      var _this5 = this;

      var tasks = arguments.length <= 0 || arguments[0] === undefined ? "default" : arguments[0];

      var _ref4 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref4$parallel = _ref4.parallel;
      var parallel = _ref4$parallel === undefined ? false : _ref4$parallel;
      var value = _ref4.value;

      _("start %o in %o", tasks, parallel ? "parallel" : "sequence");
      return _co2["default"].call(this, _regeneratorRuntime.mark(function callee$2$0(tasks) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task;

        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          var _this4 = this;

          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              if (!parallel) {
                context$3$0.next = 5;
                break;
              }

              context$3$0.next = 3;
              return tasks.map(function (task) {
                return _this4.exec(task, value, _Object$create(_this4));
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
              return context$3$0.abrupt("return", value);

            case 33:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[8, 20, 24, 32], [25,, 27, 31]]);
      }), [].concat(tasks).filter(function (task) {
        return ~_Object$keys(_this5.host).indexOf(task) || !_this5.emit("task_not_found", { task: task });
      }));
    }

    /**
      Add a writer function to the collection of writers.
      @param {Generator} function yielding a promise
     */
  }, {
    key: "write",
    value: function write(writer) {
      this._writers.push(writer.bind(this));
      return this;
    }

    /**
      Rimraf paths.
      @param {...String} paths
     */
  }, {
    key: "clear",
    value: function clear() {
      for (var _len2 = arguments.length, paths = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        paths[_key2] = arguments[_key2];
      }

      _("clear %o", paths);
      var clear = this.defer(_rimraf2["default"]);
      return (0, _flyUtil.flatten)(paths).map(function (path) {
        return clear(path);
      });
    }

    /**
      Concat read globs into one or more files.
      @param {[String]} array of name of target files
     */
  }, {
    key: "concat",
    value: function concat(name) {
      this.write(_regeneratorRuntime.mark(function callee$2$0(_ref5) {
        var path = _ref5.path;
        var source = _ref5.source;
        var target = _ref5.target;
        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              _("concat %o", target);
              _mkdirp2["default"].sync(path); // @TODO: should clear the target file to concat!
              context$3$0.next = 4;
              return (0, _mzFs.appendFile)((0, _path.join)(path, name), source, this.encoding);

            case 4:
              _("concat ✔");

            case 5:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this);
      }));
      return this;
    }

    /**
      Resolve a yieldable sequence.
      Reduce source applying available filters.
      @param {Array} destination paths
      @return {Promise}
     */
  }, {
    key: "target",
    value: function target() {
      for (var _len3 = arguments.length, dest = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        dest[_key3] = arguments[_key3];
      }

      if (this._writers.length === 0) {
        this.write(_regeneratorRuntime.mark(function callee$2$0(_ref6) {
          var target = _ref6.target;
          var source = _ref6.source;
          return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                _("write %o", target);
                _mkdirp2["default"].sync((0, _path.dirname)(target));
                context$3$0.next = 4;
                return (0, _mzFs.writeFile)(target, source, this.encoding);

              case 4:
                _("write ✔");

              case 5:
              case "end":
                return context$3$0.stop();
            }
          }, callee$2$0, this);
        }));
      }
      return _co2["default"].call(this, _regeneratorRuntime.mark(function callee$2$0() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, glob, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _loop, _iterator3, _step3, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5;

        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          var _this6 = this;

          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              _("target %o", dest);
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              context$3$0.prev = 4;
              _iterator2 = _getIterator(this._globs);

            case 6:
              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                context$3$0.next = 39;
                break;
              }

              glob = _step2.value;
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              context$3$0.prev = 11;
              _loop = _regeneratorRuntime.mark(function callee$3$0() {
                var file, _parse, dir, name, _ext, globCache, _ref7, data, ext, path, write;

                return _regeneratorRuntime.wrap(function callee$3$0$(context$4$0) {
                  while (1) switch (context$4$0.prev = context$4$0.next) {
                    case 0:
                      file = _step3.value;

                      _("file %o", file);
                      _parse = (0, _path.parse)(file);
                      dir = _parse.dir;
                      name = _parse.name;
                      _ext = _parse.ext;
                      globCache = glob.split(_path.sep);
                      context$4$0.t0 = _regeneratorRuntime.mark(function reduce(data, ext, filters) {
                        var f;
                        return _regeneratorRuntime.wrap(function reduce$(context$5$0) {
                          while (1) switch (context$5$0.prev = context$5$0.next) {
                            case 0:
                              f = filters[0];

                              if (!(filters.length === 0)) {
                                context$5$0.next = 5;
                                break;
                              }

                              context$5$0.t0 = { data: data, ext: ext };
                              context$5$0.next = 16;
                              break;

                            case 5:
                              context$5$0.t1 = reduce;
                              context$5$0.t2 = this;
                              context$5$0.next = 9;
                              return _Promise.resolve(f.transform.call(this, data, f.options));

                            case 9:
                              context$5$0.t3 = context$5$0.sent;
                              context$5$0.t4 = f.ext || ext;
                              context$5$0.t5 = filters.slice(1);
                              context$5$0.t6 = _("filter %s", f.transform);
                              context$5$0.next = 15;
                              return context$5$0.t1.call.call(context$5$0.t1, context$5$0.t2, context$5$0.t3, context$5$0.t4, context$5$0.t5, context$5$0.t6);

                            case 15:
                              context$5$0.t0 = context$5$0.sent;

                            case 16:
                              return context$5$0.abrupt("return", context$5$0.t0);

                            case 17:
                            case "end":
                              return context$5$0.stop();
                          }
                        }, reduce, this);
                      });
                      context$4$0.t1 = this;
                      context$4$0.next = 11;
                      return (0, _mzFs.readFile)(file);

                    case 11:
                      context$4$0.t2 = context$4$0.sent;
                      context$4$0.t3 = "" + context$4$0.t2;
                      context$4$0.t4 = _ext;
                      context$4$0.t5 = this._filters;
                      context$4$0.next = 17;
                      return context$4$0.t0.call.call(context$4$0.t0, context$4$0.t1, context$4$0.t3, context$4$0.t4, context$4$0.t5);

                    case 17:
                      _ref7 = context$4$0.sent;
                      data = _ref7.data;
                      ext = _ref7.ext;

                      _("filter ✔");
                      _iteratorNormalCompletion4 = true;
                      _didIteratorError4 = false;
                      _iteratorError4 = undefined;
                      context$4$0.prev = 24;
                      _iterator4 = _getIterator((0, _flyUtil.flatten)(dest));

                    case 26:
                      if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                        context$4$0.next = 57;
                        break;
                      }

                      path = _step4.value;
                      _iteratorNormalCompletion5 = true;
                      _didIteratorError5 = false;
                      _iteratorError5 = undefined;
                      context$4$0.prev = 31;
                      _iterator5 = _getIterator(this._writers);

                    case 33:
                      if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                        context$4$0.next = 40;
                        break;
                      }

                      write = _step5.value;
                      context$4$0.next = 37;
                      return write({
                        path: path, source: data,
                        target: (0, _path.join)(path, _path.join.apply(undefined, _toConsumableArray(dir.split(_path.sep).filter(function (p) {
                          return ! ~globCache.indexOf(p);
                        }))), "" + name + ext)
                      });

                    case 37:
                      _iteratorNormalCompletion5 = true;
                      context$4$0.next = 33;
                      break;

                    case 40:
                      context$4$0.next = 46;
                      break;

                    case 42:
                      context$4$0.prev = 42;
                      context$4$0.t6 = context$4$0["catch"](31);
                      _didIteratorError5 = true;
                      _iteratorError5 = context$4$0.t6;

                    case 46:
                      context$4$0.prev = 46;
                      context$4$0.prev = 47;

                      if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                        _iterator5["return"]();
                      }

                    case 49:
                      context$4$0.prev = 49;

                      if (!_didIteratorError5) {
                        context$4$0.next = 52;
                        break;
                      }

                      throw _iteratorError5;

                    case 52:
                      return context$4$0.finish(49);

                    case 53:
                      return context$4$0.finish(46);

                    case 54:
                      _iteratorNormalCompletion4 = true;
                      context$4$0.next = 26;
                      break;

                    case 57:
                      context$4$0.next = 63;
                      break;

                    case 59:
                      context$4$0.prev = 59;
                      context$4$0.t7 = context$4$0["catch"](24);
                      _didIteratorError4 = true;
                      _iteratorError4 = context$4$0.t7;

                    case 63:
                      context$4$0.prev = 63;
                      context$4$0.prev = 64;

                      if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                      }

                    case 66:
                      context$4$0.prev = 66;

                      if (!_didIteratorError4) {
                        context$4$0.next = 69;
                        break;
                      }

                      throw _iteratorError4;

                    case 69:
                      return context$4$0.finish(66);

                    case 70:
                      return context$4$0.finish(63);

                    case 71:
                    case "end":
                      return context$4$0.stop();
                  }
                }, callee$3$0, _this6, [[24, 59, 63, 71], [31, 42, 46, 54], [47,, 49, 53], [64,, 66, 70]]);
              });
              context$3$0.next = 15;
              return (0, _flyUtil.expand)(glob);

            case 15:
              context$3$0.t0 = _Symbol$iterator;
              _iterator3 = context$3$0.sent[context$3$0.t0]();

            case 17:
              if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                context$3$0.next = 22;
                break;
              }

              return context$3$0.delegateYield(_loop(), "t1", 19);

            case 19:
              _iteratorNormalCompletion3 = true;
              context$3$0.next = 17;
              break;

            case 22:
              context$3$0.next = 28;
              break;

            case 24:
              context$3$0.prev = 24;
              context$3$0.t2 = context$3$0["catch"](11);
              _didIteratorError3 = true;
              _iteratorError3 = context$3$0.t2;

            case 28:
              context$3$0.prev = 28;
              context$3$0.prev = 29;

              if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                _iterator3["return"]();
              }

            case 31:
              context$3$0.prev = 31;

              if (!_didIteratorError3) {
                context$3$0.next = 34;
                break;
              }

              throw _iteratorError3;

            case 34:
              return context$3$0.finish(31);

            case 35:
              return context$3$0.finish(28);

            case 36:
              _iteratorNormalCompletion2 = true;
              context$3$0.next = 6;
              break;

            case 39:
              context$3$0.next = 45;
              break;

            case 41:
              context$3$0.prev = 41;
              context$3$0.t3 = context$3$0["catch"](4);
              _didIteratorError2 = true;
              _iteratorError2 = context$3$0.t3;

            case 45:
              context$3$0.prev = 45;
              context$3$0.prev = 46;

              if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                _iterator2["return"]();
              }

            case 48:
              context$3$0.prev = 48;

              if (!_didIteratorError2) {
                context$3$0.next = 51;
                break;
              }

              throw _iteratorError2;

            case 51:
              return context$3$0.finish(48);

            case 52:
              return context$3$0.finish(45);

            case 53:
              _("done ✔");

            case 54:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[4, 41, 45, 53], [11, 24, 28, 36], [29,, 31, 35], [46,, 48, 52]]);
      }));
    }
  }]);

  return Fly;
})(_emitter2["default"]);

exports["default"] = Fly;
module.exports = exports["default"];