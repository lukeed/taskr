"use strict";

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

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

var _util = require("./util");

var _ = _interopRequireWildcard(_util);

var Fly = (function (_Emitter) {
  /**
    @param {Object} host Flyfile
    @param {String} root Relative base path / root.
    @param {Array} plugins List of plugins to load.
    @desc Create a new instance of Fly. Use fly.start(...) to run tasks.
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
    this.encoding = process.env.ENCODING;
    this.host = this.tasks = {};
    this.defer = _.defer;
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
      @desc Log a message with a time stamp as defined in fly-fmt.
     */
    value: function log() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _.log("[" + _fmt2["default"].time + "] " + args);
      return this;
    }
  }, {
    key: "reset",

    /**
      @desc Reset the internal state.
     */
    value: function reset() {
      this._src = [];
      this._filters = [];
      this._writers = [];
      return this;
    }
  }, {
    key: "clear",

    /**
      @param {...String} paths
      @desc Clear each specified directory. Wraps rimraf.
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
      @param {String} name File name to concatenate unwrapped sources.
      @desc Concatenates files read via source.
      @todo: clear files before appending to them.
     */
    value: function concat(name) {
      var _this2 = this;

      this._writers.push(function (_ref2) {
        var dest = _ref2.dest;
        var data = _ref2.data;

        _mkdirp2["default"].sync(dest);
        return _mzFs2["default"].appendFile((0, _path.join)(dest, name), data, _this2.encoding);
      });
      return this;
    }
  }, {
    key: "filter",

    /**
      @param {...Function} filters
      @desc Add a filter to be applied when unwrapping the source promises.
     */
    value: function filter() {
      var _this3 = this;

      for (var _len3 = arguments.length, filters = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        filters[_key3] = arguments[_key3];
      }

      filters.forEach(function (filter) {
        return _this3._filters.push(filter);
      });
      return this;
    }
  }, {
    key: "watch",

    /**
      @param {Array} globs Glob pattern to watch for changes.
      @param {...String} tasks List of tasks to apply.
      @desc Run the specified tasks when a change is detected in the globs.
     */
    value: function watch(globs) {
      var _this4 = this;

      for (var _len4 = arguments.length, tasks = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        tasks[_key4 - 1] = arguments[_key4];
      }

      _.watch.apply(_, [globs].concat(tasks)).on("change", function () {
        return _this4.start(tasks);
      });
      return this;
    }
  }, {
    key: "start",

    /**
      @param {Array} tasks List of tasks to run
      @desc Runs the specified tasks.
     */
    value: function start() {
      var tasks = arguments[0] === undefined ? [] : arguments[0];

      if (tasks.length === 0) tasks.push("default");
      _co2["default"].call(this, _regeneratorRuntime.mark(function callee$2$0() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task, start;

        return _regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          var _this5 = this;

          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              context$3$0.prev = 3;
              _iterator = _getIterator([].concat(tasks).filter(function (task) {
                return ~_Object$keys(_this5.host).indexOf(task) || !_this5.notify("task_not_found", { task: task });
              }));

            case 5:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                context$3$0.next = 21;
                break;
              }

              task = _step.value;
              start = new Date();

              this.notify("task_start", { task: task });
              context$3$0.prev = 9;
              context$3$0.next = 12;
              return this.tasks[task].call(this);

            case 12:
              this.notify("task_complete", {
                task: task, duration: new Date().getTime() - start
              });
              context$3$0.next = 18;
              break;

            case 15:
              context$3$0.prev = 15;
              context$3$0.t0 = context$3$0["catch"](9);

              this.notify("task_error", { task: task, error: context$3$0.t0 });

            case 18:
              _iteratorNormalCompletion = true;
              context$3$0.next = 5;
              break;

            case 21:
              context$3$0.next = 27;
              break;

            case 23:
              context$3$0.prev = 23;
              context$3$0.t1 = context$3$0["catch"](3);
              _didIteratorError = true;
              _iteratorError = context$3$0.t1;

            case 27:
              context$3$0.prev = 27;
              context$3$0.prev = 28;

              if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
              }

            case 30:
              context$3$0.prev = 30;

              if (!_didIteratorError) {
                context$3$0.next = 33;
                break;
              }

              throw _iteratorError;

            case 33:
              return context$3$0.finish(30);

            case 34:
              return context$3$0.finish(27);

            case 35:
            case "end":
              return context$3$0.stop();
          }
        }, callee$2$0, this, [[3, 23, 27, 35], [9, 15], [28,, 30, 34]]);
      }));
    }
  }, {
    key: "source",

    /**
      @param {...String} globs Glob pattern
      @desc expand resolves to an array of file names from the glob pattern.
      Each file is mapped to a read file promise that resolves in a recursive
      filter returning { file, data }
    */
    value: function source() {
      var _this6 = this;

      for (var _len5 = arguments.length, globs = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        globs[_key5] = arguments[_key5];
      }

      globs.forEach(function (pattern) {
        var base = (function (base) {
          return base.length > 1 ? base.shift() : "";
        })(pattern.split("*"));
        _this6.reset()._src.push(_.expand(pattern, function (files) {
          return files.map(function (file) {
            return _mzFs2["default"].readFile(file, _this6.encoding).then(function (data) {
              return (function filter(_x3, _x4) {
                var _this7 = this;

                var _again = true;

                _function: while (_again) {
                  var data = _x3,
                      filters = _x4;
                  _again = false;
                  if (filters.length > 0) {
                    _x3 = filters[0].call(_this7, data);
                    _x4 = filters.slice(1);
                    _again = true;
                    continue _function;
                  } else {
                    return { file: file, data: data, base: base };
                  }
                }
              }).call(_this6, "" + data, _this6._filters);
            });
          });
        }));
      });
      return this;
    }
  }, {
    key: "unwrap",

    /**
      @param {Array:Promise} source
      @desc Resolves an array of promises an return a new promise with the result.
     */
    value: function unwrap() {
      var _this8 = this;

      var source = arguments[0] === undefined ? this._src : arguments[0];

      return new _Promise(function (resolve) {
        _Promise.all(source).then(function (result) {
          return resolve.apply(_this8, result);
        });
      });
    }
  }, {
    key: "target",

    /**
      @param {...String} dest Destination paths
      @desc Resolves all source promises and writes to each destination path.
     */
    value: function target() {
      var _this9 = this;

      for (var _len6 = arguments.length, dest = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        dest[_key6] = arguments[_key6];
      }

      return _Promise.all(dest.map(function (dest) {
        return _this9.unwrap(_this9._src).then(function (files) {
          return files.map(function (_ref3) {
            var file = _ref3.file;
            var data = _ref3.data;
            var base = _ref3.base;

            return (function (file) {
              if (!_this9._writers.length) {
                _mkdirp2["default"].sync((0, _path.dirname)(file));
                return _mzFs2["default"].writeFile(file, data, _this9.encoding);
              }
              return _this9._writers.map(function (write) {
                return write({ dest: dest, base: base, file: file, data: data });
              });
            })((0, _path.join)(dest, file.replace(base, "")));
          });
        });
      }));
    }
  }]);

  return Fly;
})(_emitter2["default"]);

exports["default"] = Fly;
module.exports = exports["default"];