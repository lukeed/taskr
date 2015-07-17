"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawn = spawn;
var marked0$0 = [spawn].map(_regeneratorRuntime.mark);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _flyUtil = require("fly-util");

/**
  Resolve flyfile using flypath and create a new Fly instance.
  @param {String} flypath Path to a flyfile
 */

function spawn(flypath) {
  var host, root, load, plugins;
  return _regeneratorRuntime.wrap(function spawn$(context$1$0) {
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

        context$1$0.next = 5;
        return _regeneratorRuntime.mark(function callee$1$0() {
          return _regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                context$2$0.prev = 0;
                return context$2$0.abrupt("return", (0, _flyUtil.findPlugins)(load("package")).reduce(function (prev, next) {
                  return prev.concat(load("node_modules", next));
                }, []));

              case 4:
                context$2$0.prev = 4;
                context$2$0.t0 = context$2$0["catch"](0);
                (0, _flyUtil.warn)("" + context$2$0.t0.message);
              case 7:
              case "end":
                return context$2$0.stop();
            }
          }, callee$1$0, this, [[0, 4]]);
        })();

      case 5:
        plugins = context$1$0.sent;
        return context$1$0.abrupt("return", { host: host, root: root, plugins: plugins });

      case 7:
      case "end":
        return context$1$0.stop();
    }
  }, marked0$0[0], this);
}