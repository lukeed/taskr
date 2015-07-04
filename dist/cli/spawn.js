"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fly = require("../fly");

var _fly2 = _interopRequireDefault(_fly);

var _util = require("../util");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

/**
  Resolve flyfile using flypath and create a new Fly instance.
  @param {String} flypath Path to a flyfile
 */
exports["default"] = _regeneratorRuntime.mark(function callee$0$0(flypath) {
  var host, root, load, pkg, plugins;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        host = require(flypath);
        root = _path2["default"].dirname(flypath);

        load = function load() {
          for (var _len = arguments.length, file = Array(_len), _key = 0; _key < _len; _key++) {
            file[_key] = arguments[_key];
          }

          return require(_path2["default"].join.apply(_path2["default"], [root].concat(file)));
        };

        pkg = (function () {
          try {
            return load("package");
          } catch (_) {}
        })();

        plugins = (0, _util.searchPlugins)({ pkg: pkg }).reduce(function (prev, next) {
          return prev.concat(load("node_modules", next));
        }, []);
        return context$1$0.abrupt("return", new _fly2["default"]({ host: host, root: root, plugins: plugins }));

      case 6:
      case "end":
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports["default"];