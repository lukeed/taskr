"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parsec = require("parsec");

var _parsec2 = _interopRequireDefault(_parsec);

var _util = require("./util");

var _reporter = require("./reporter");

var _reporter2 = _interopRequireDefault(_reporter);

var _cli = require("./cli/");

var _cli2 = _interopRequireDefault(_cli);

var _package = require("../package");

var _package2 = _interopRequireDefault(_package);

exports["default"] = _regeneratorRuntime.mark(function callee$0$0() {
  var _Parsec$parse$options$options$options$options, help, list, file, version, tasks, path;

  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        (0, _util.notifyUpdates)({ pkg: _package2["default"] });

        _Parsec$parse$options$options$options$options = _parsec2["default"].parse(process.argv).options("file", { "default": "./" }).options("list").options("help").options("version");
        help = _Parsec$parse$options$options$options$options.help;
        list = _Parsec$parse$options$options$options$options.list;
        file = _Parsec$parse$options$options$options$options.file;
        version = _Parsec$parse$options$options$options$options.version;
        tasks = _Parsec$parse$options$options$options$options._;

        if (!help) {
          context$1$0.next = 11;
          break;
        }

        _cli2["default"].help();

        context$1$0.next = 29;
        break;

      case 11:
        if (!version) {
          context$1$0.next = 15;
          break;
        }

        _cli2["default"].version(_package2["default"]);

        context$1$0.next = 29;
        break;

      case 15:
        context$1$0.next = 17;
        return (0, _util.resolve)({ file: file });

      case 17:
        path = context$1$0.sent;

        if (!list) {
          context$1$0.next = 22;
          break;
        }

        _cli2["default"].list(path, { simple: list === "simple" });
        context$1$0.next = 29;
        break;

      case 22:
        context$1$0.t0 = _reporter2["default"];
        context$1$0.next = 25;
        return _cli2["default"].spawn(path);

      case 25:
        context$1$0.t1 = context$1$0.sent;
        context$1$0.t2 = { path: path };
        context$1$0.t3 = tasks;
        context$1$0.t0.call.call(context$1$0.t0, context$1$0.t1).notify("fly_run", context$1$0.t2).start(context$1$0.t3);

      case 29:
      case "end":
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports["default"];