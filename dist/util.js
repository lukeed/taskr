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
exports.defer = defer;
exports.resolve = resolve;
exports.plugins = plugins;
exports.expand = expand;
exports.watch = watch;
exports.notifyUpdates = notifyUpdates;
var marked0$0 = [resolve].map(_regeneratorRuntime.mark);

var _mzFs = require("mz/fs");

var _mzFs2 = _interopRequireDefault(_mzFs);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

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
  Resolve the Flyfile path. Check the file extension for JavaScript variants.
  @param {String} file or path to the Flyfile
  @param [{String}] Flyfile variant name
  @return {String} path to the Flyfile
 */

function resolve(_ref) {
  var file = _ref.file;
  var _ref$name = _ref.name;
  var name = _ref$name === undefined ? "Flyfile" : _ref$name;
  var root, path, mod;
  return _regeneratorRuntime.wrap(function resolve$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        root = (0, _path.join)(process.cwd(), file);
        context$1$0.next = 3;
        return _mzFs2["default"].stat(file);

      case 3:
        if (!context$1$0.sent.isDirectory()) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.t0 = (0, _path.join)(root, name);
        context$1$0.next = 8;
        break;

      case 7:
        context$1$0.t0 = root;

      case 8:
        path = context$1$0.t0;
        mod = _interpret.jsVariants["." + (path.split(".").slice(1).join(".") || "js")];

        if (Array.isArray(mod)) require(mod[0]);else if (mod) require(mod.module);
        return context$1$0.abrupt("return", path);

      case 12:
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
  Wrapper for chokidar.watch. Array of globs are flattened.
  @param {Array:String} globs
  @param {...String} tasks Tasks to run
  @return {chokidar.FSWatcher}
 */

function watch(globs, opts) {
  return _chokidar2["default"].watch((function flatten(array) {
    return array.reduce(function (flat, next) {
      return flat.concat(Array.isArray(next) ? flatten(next) : next);
    }, []);
  })([globs]), opts);
}

/** Wrapper for update-notifier */

function notifyUpdates(options) {
  (0, _updateNotifier2["default"])(options).notify();
}