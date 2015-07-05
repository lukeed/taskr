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
    Create a new instance of Fly. Use fly.start(...) to run tasks.
    @param {Object} Flyfile, also known as host
    @param {String} relative base path / root
    @param {Array} list of plugins to load.
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
    this.encoding = process.env.ENCODING;
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
      Log a message with a time stamp as defined in /fmt.
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
      Clear each specified directory. Wraps rimraf.
      @param {...String} paths
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
      Concatenates files read via source.
      @param {String} name of the concatenated file
      @TODO: by default this operation should clear the target file to concat
     */
    value: function concat(name) {
      var _this2 = this;

      this._writers.push(function (_ref2) {
        var dest = _ref2.dest;
        var data = _ref2.data;

        _mkdirp2["default"].sync(dest);
        _mzFs2["default"].appendFile((0, _path.join)(dest, name), data, _this2.encoding);
      });
      return this;
    }
  }, {
    key: "filter",

    /**
      Add a filter to be applied when unwrapping the source promises.
      @param {
        {String} name of the filter.
        {Object} { filter, options } object.
        {Function} filter function.
      }
      @param [{Function}] filter function.
     */
    value: function filter(name, _filter) {
      var _this3 = this;

      if (name instanceof Function) {
        this.filter({ filter: name });
      } else if (typeof name === "object") {
        this._filters.push(name);
      } else {
        if (this[name] instanceof Function) throw new Error(name + " method already defined in instance.");
        this[name] = function (options) {
          return _this3.filter({ filter: _filter, options: options });
        };
      }
      return this;
    }
  }, {
    key: "watch",

    /**
      Watch for changes on globs and run each of the specified tasks.
      @param {Array:String} glob patterns to observe for changes
      @param {Array:String} list of tasks to run on changes
     */
    value: function watch(globs, tasks) {
      var _this4 = this;

      this.notify("fly_watch").start(tasks);
      _.watch(globs, { ignoreInitial: true }).on("all", function () {
        return _this4.start(tasks);
      });
      return this;
    }
  }, {
    key: "start",

    /**
      Runs the specified tasks.
      @param {Array} list of tasks to run
     */
    value: function start() {
      var tasks = arguments[0] === undefined ? [] : arguments[0];

      if (tasks.length === 0) tasks.push(this.host["default"] ? "default" : "main");
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
      return this;
    }
  }, {
    key: "source",

    /**
      Creates an array of promises with read sources from a list of globs.
      When a promise resolved, the data source is reduced applying each of
      the existing filters.
      @param {...String} glob patterns
      @return Fly instance. Promises resolve to { file, data }
    */
    value: function source() {
      var _this6 = this;

      this._source = [];
      this._filters = [];
      this._writers = [];

      for (var _len3 = arguments.length, globs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        globs[_key3] = arguments[_key3];
      }

      _.flatten(globs).forEach(function (pattern) {
        var base = (function (base) {
          return base.length > 1 ? base.shift() : "";
        })(pattern.split("*"));

        _this6._source.push(_.expand(pattern, function (files) {
          return files.map(function (file) {
            return _mzFs2["default"].readFile(file, _this6.encoding).then(function (data) {
              return (function reduce(_x3, _x4) {
                var _this7 = this;

                var _again = true;

                _function: while (_again) {
                  var data = _x3,
                      filters = _x4;
                  _again = false;
                  if (filters.length > 0) {
                    _x3 = filters[0].filter.apply(_this7, [data, filters[0].options]);
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
      Resolves an array of promises an return a new promise with the result.
      By default resolves the current promise sources.
      @param {Array:Promise} source
     */
    value: function unwrap() {
      var _this8 = this;

      var source = arguments[0] === undefined ? this._source : arguments[0];

      return new _Promise(function (resolve) {
        _Promise.all(source).then(function (result) {
          return resolve.apply(_this8, result);
        });
      });
    }
  }, {
    key: "target",

    /**
      Resolves all source promises and writes to each destination path.
      @param {...String} destination paths
     */
    value: function target() {
      var _this9 = this;

      for (var _len4 = arguments.length, dest = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        dest[_key4] = arguments[_key4];
      }

      return _Promise.all(_.flatten(dest).map(function (dest) {
        return _this9.unwrap(_this9._source).then(function (files) {
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