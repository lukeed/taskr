"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fly = require("./fly");

var _fly2 = _interopRequireDefault(_fly);

var _parsec = require("parsec");

var _parsec2 = _interopRequireDefault(_parsec);

var _reporter = require("./reporter");

var _reporter2 = _interopRequireDefault(_reporter);

var _cli = require("./cli/");

var cli = _interopRequireWildcard(_cli);

var _flyUtil = require("fly-util");

var _package = require("../package");

var _package2 = _interopRequireDefault(_package);

(0, _flyUtil.notifyUpdates)({ pkg: _package2["default"] });

exports["default"] = _regeneratorRuntime.mark(function callee$0$0() {
  var _Parsec$parse$options$options$options$options, help, list, file, version, tasks, path;

  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _Parsec$parse$options$options$options$options = _parsec2["default"].parse(process.argv).options("file", { "default": "./" }).options("list").options("help").options("version");
        help = _Parsec$parse$options$options$options$options.help;
        list = _Parsec$parse$options$options$options$options.list;
        file = _Parsec$parse$options$options$options$options.file;
        version = _Parsec$parse$options$options$options$options.version;
        tasks = _Parsec$parse$options$options$options$options._;

        if (!help) {
          context$1$0.next = 10;
          break;
        }

        cli.help();
        context$1$0.next = 30;
        break;

      case 10:
        if (!version) {
          context$1$0.next = 14;
          break;
        }

        cli.version(_package2["default"]);
        context$1$0.next = 30;
        break;

      case 14:
        context$1$0.next = 16;
        return (0, _flyUtil.findPath)(file);

      case 16:
        path = context$1$0.sent;

        if (!list) {
          context$1$0.next = 21;
          break;
        }

        cli.list(path, { simple: list === "bare" });
        context$1$0.next = 30;
        break;

      case 21:
        context$1$0.t0 = _reporter2["default"];
        context$1$0.t1 = _fly2["default"];
        context$1$0.next = 25;
        return cli.spawn(path);

      case 25:
        context$1$0.t2 = context$1$0.sent;
        context$1$0.t3 = new context$1$0.t1(context$1$0.t2);
        context$1$0.t4 = { path: path };
        context$1$0.t5 = tasks;
        return context$1$0.abrupt("return", context$1$0.t0.call.call(context$1$0.t0, context$1$0.t3).emit("fly_run", context$1$0.t4).start(context$1$0.t5));

      case 30:
      case "end":
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports["default"];