"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.error = error;
exports.trace = trace;
exports.defer = defer;
exports.find = find;
exports.plugins = plugins;
exports.expand = expand;
exports.flatten = flatten;
exports.watch = watch;
exports.notifyUpdates = notifyUpdates;
var marked0$0 = [find].map(_regeneratorRuntime.mark);

var _mzFs = require("mz/fs");

var _mzFs2 = _interopRequireDefault(_mzFs);

var _fmt = require("./fmt");

var _fmt2 = _interopRequireDefault(_fmt);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _prettyjson = require("prettyjson");

var _prettyjson2 = _interopRequireDefault(_prettyjson);

var _chokidar = require("chokidar");

var _chokidar2 = _interopRequireDefault(_chokidar);

var _path = require("path");

var _interpret = require("interpret");

var _updateNotifier = require("update-notifier");

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

/** console.log wrapper */

function log() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  console.log.apply(console, args);
}

/** console.error wrapper */

function error() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  console.error.apply(console, args);
}

/**
 */

function trace(e) {
  error(_prettyjson2["default"].render(e).replace(/(\sFunction|\sObject)\./g, _fmt2["default"].blue("$1") + ".").replace(/\((~?\/.*)\)/g, "(" + _fmt2["default"].gray("$1") + ")").replace(/:([0-9]*):([0-9]*)/g, " " + _fmt2["default"].yellow("$1") + ":" + _fmt2["default"].yellow("$2")).replace(new RegExp(process.env.HOME, "g"), "~"));
}

/**
  Promisify an async function.
  @param {Function} async function to promisify
  @return {Promise}
 */

function defer(asyncFunc) {
  var _this = this;

  return function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return new _Promise(function (resolve, reject) {
      return asyncFunc.apply(_this, args.concat(function (err) {
        for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }

        return err ? reject(err) : resolve(args);
      }));
    });
  };
}

/**
  Resolve the Flyfile path. Check the file extension and attempt to load
  every possible JavaScript variant if `file` is a directory.
  @param {String} file or path to the Flyfile
  @param [{String}] Flyfile variant name
  @return {String} path to the Flyfile
 */

function find(_ref) {
  var file = _ref.file;
  var _ref$names = _ref.names;
  var names = _ref$names === undefined ? ["Flyfile", "Flypath"] : _ref$names;
  var marked1$0, root, hook, resolve, match;
  return _regeneratorRuntime.wrap(function find$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        match = function match(files, exts) {
          return files.length === 1 ? exts.map(function (ext) {
            return "" + files[0] + ext;
          }) : match([files[0]], exts).concat(match(files.slice(1), exts));
        };

        resolve = function resolve(paths) {
          return _regeneratorRuntime.wrap(function resolve$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                if (!(paths.length === 0)) {
                  context$2$0.next = 2;
                  break;
                }

                throw { code: "ENOENT" };

              case 2:
                context$2$0.prev = 2;
                context$2$0.next = 5;
                return _mzFs2["default"].stat(paths[0]);

              case 5:
                if (!context$2$0.sent) {
                  context$2$0.next = 7;
                  break;
                }

                return context$2$0.abrupt("return", paths[0]);

              case 7:
                context$2$0.next = 14;
                break;

              case 9:
                context$2$0.prev = 9;
                context$2$0.t0 = context$2$0["catch"](2);
                context$2$0.next = 13;
                return resolve(paths.slice(1));

              case 13:
                return context$2$0.abrupt("return", context$2$0.sent);

              case 14:
              case "end":
                return context$2$0.stop();
            }
          }, marked1$0[0], this, [[2, 9]]);
        };

        hook = function hook(require, path) {
          var js = _interpret.jsVariants["." + (path.split(".").slice(1).join(".") || "js")];
          if (Array.isArray(js)) {
            (function reduce(modules) {
              if (modules.length === 0) return;
              try {
                require(modules[0].module);
              } catch (_) {
                reduce(modules.slice(1));
              }
            })(js);
          } else if (js) require(js.module);
          return path;
        };

        marked1$0 = [resolve].map(_regeneratorRuntime.mark);
        root = (0, _path.join)(process.cwd(), file);
        context$1$0.t0 = require;
        context$1$0.next = 8;
        return _mzFs2["default"].stat(file);

      case 8:
        if (!context$1$0.sent.isDirectory()) {
          context$1$0.next = 14;
          break;
        }

        context$1$0.next = 11;
        return resolve(match(names.concat(names.map(function (name) {
          return name.toLowerCase();
        })).map(function (name) {
          return (0, _path.join)(root, name);
        }), _Object$keys(_interpret.jsVariants)));

      case 11:
        context$1$0.t1 = context$1$0.sent;
        context$1$0.next = 15;
        break;

      case 14:
        context$1$0.t1 = root;

      case 15:
        context$1$0.t2 = context$1$0.t1;
        return context$1$0.abrupt("return", hook(context$1$0.t0, context$1$0.t2));

      case 17:
      case "end":
        return context$1$0.stop();
    }
  }, marked0$0[0], this);
}

/**
  Load `fly-*` plugins from a package.json deps.
  @param {Package} opts.pkg
  @param {Array} opts.deps
  @param {Array} opts.blacklist
  @return {Array} List of fly deps that can be loaded.
 */

function plugins(_ref2) {
  var pkg = _ref2.pkg;
  var deps = _ref2.deps;
  var _ref2$blacklist = _ref2.blacklist;
  var blacklist = _ref2$blacklist === undefined ? [] : _ref2$blacklist;

  if (pkg) {
    deps = ["dependencies", "devDependencies", "peerDependencies"].filter(function (key) {
      return key in pkg;
    }).reduce(function (p, c) {
      return [].concat(_Object$keys(pkg[p]), _Object$keys(pkg[c]));
    });
  }
  return deps.filter(function (dep) {
    return /^fly-.+/g.test(dep);
  }).filter(function (dep) {
    return ! ~blacklist.indexOf(dep);
  }).reduce(function (prev, curr) {
    return [].concat(prev, curr);
  }, []);
}

/**
  Expand a glob pattern and runs a handler for each expanded glob.
  @param pattern {String} Pattern to be matched
  @param handler {Function} Function to run for each unwrapped glob promise.
  @return {Promise}
 */

function expand(pattern, handler) {
  return new _Promise(function (resolve, reject) {
    (0, _glob2["default"])(pattern, {}, function (error, files) {
      return error ? reject(error) : _Promise.all(handler(files)).then(function (files) {
        return resolve(files);
      })["catch"](function (error) {
        throw error;
      });
    });
  });
}

/**
  Flattens a nested array recursively.
  @return [[a],[b],[c]] -> [a,b,c]
 */

function flatten(array) {
  return array.reduce(function (flat, next) {
    return flat.concat(Array.isArray(next) ? flatten(next) : next);
  }, []);
}

/**
  Wrapper for chokidar.watch. Array of globs are flattened.
  @param {Array:String} globs
  @param {...String} tasks Tasks to run
  @return {chokidar.FSWatcher}
 */

function watch(globs, opts) {
  return _chokidar2["default"].watch(flatten([globs]), opts);
}

/**
  Wrapper for update-notifier.
  @param {Array} options
 */

function notifyUpdates(options) {
  (0, _updateNotifier2["default"])(options).notify();
}

/**
  Add require hook so that subsequent calls to require transform the
  JavaScript source variant (ES7, CoffeeScript, etc.) in the fly.
  @param {Function} require function to load selected module
  @param {String} path to Flyfile
  @return {String} path to Flyfile
  @private
 */

/**
  Resolve to the first existing file in paths.
  @param {Array:String} list of paths to search
  @return {String} path of an existing file
  @private
 */

/**
  Match files and extensions.
  @param {Array:String} List of files to match
  @param {Array:String} List of extensions to match
  @return {Array} Product of matched files * extensions
  @private
 */