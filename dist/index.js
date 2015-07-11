"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parsec = require("parsec");

var _parsec2 = _interopRequireDefault(_parsec);

var _flyUtil = require("fly-util");

var _reporter = require("./reporter");

var _reporter2 = _interopRequireDefault(_reporter);

var _cli = require("./cli/");

var _cli2 = _interopRequireDefault(_cli);

var _package = require("../package");

var _package2 = _interopRequireDefault(_package);

(0, _flyUtil.notifyUpdates)({ pkg: _package2["default"] });

var _Parsec$parse$options$options$options$options = _parsec2["default"].parse(process.argv).options("file", { "default": "./" }).options("list").options("help").options("version");

var help = _Parsec$parse$options$options$options$options.help;
var list = _Parsec$parse$options$options$options$options.list;
var file = _Parsec$parse$options$options$options$options.file;
var version = _Parsec$parse$options$options$options$options.version;
var tasks = _Parsec$parse$options$options$options$options._;
exports["default"] = _regeneratorRuntime.mark(function callee$0$0() {
  var path;
  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!help) {
          context$1$0.next = 4;
          break;
        }

        _cli2["default"].help();
        context$1$0.next = 22;
        break;

      case 4:
        if (!version) {
          context$1$0.next = 8;
          break;
        }

        _cli2["default"].version(_package2["default"]);
        context$1$0.next = 22;
        break;

      case 8:
        context$1$0.next = 10;
        return (0, _flyUtil.findFlypath)(file);

      case 10:
        path = context$1$0.sent;

        if (!list) {
          context$1$0.next = 15;
          break;
        }

        _cli2["default"].list(path, { simple: list === "simple" });
        context$1$0.next = 22;
        break;

      case 15:
        context$1$0.t0 = _reporter2["default"];
        context$1$0.next = 18;
        return _cli2["default"].spawn(path);

      case 18:
        context$1$0.t1 = context$1$0.sent;
        context$1$0.t2 = { path: path };
        context$1$0.t3 = tasks;
        context$1$0.t0.call.call(context$1$0.t0, context$1$0.t1).notify("fly_run", context$1$0.t2).start(context$1$0.t3);

      case 22:
      case "end":
        return context$1$0.stop();
    }
  }, callee$0$0, this);
});
module.exports = exports["default"];