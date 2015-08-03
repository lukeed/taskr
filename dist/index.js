"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

var _co = require("co");

var _co2 = _interopRequireDefault(_co);

var _parsec = require("parsec");

var _parsec2 = _interopRequireDefault(_parsec);

var _reporter = require("./reporter");

var _reporter2 = _interopRequireDefault(_reporter);

var _cli = require("./cli/");

var cli = _interopRequireWildcard(_cli);

var _flyUtil = require("fly-util");

var _package = require("../package");

var _package2 = _interopRequireDefault(_package);

(0, _co2["default"])(_regeneratorRuntime.mark(function callee$0$0() {
  var _Parsec$options$options$options$options$parse, help, list, file, version, tasks, fly;

  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        (0, _flyUtil.notifyUpdates)({ pkg: _package2["default"] });
        _Parsec$options$options$options$options$parse = _parsec2["default"].options("file", { "default": "." }).options("list").options("help").options("version").parse(process.argv, { strictMode: true });
        help = _Parsec$options$options$options$options$parse.help;
        list = _Parsec$options$options$options$options$parse.list;
        file = _Parsec$options$options$options$options$parse.file;
        version = _Parsec$options$options$options$options$parse.version;
        tasks = _Parsec$options$options$options$options$parse._;

        if (!help) {
          context$1$0.next = 11;
          break;
        }

        cli.help();
        context$1$0.next = 23;
        break;

      case 11:
        if (!version) {
          context$1$0.next = 15;
          break;
        }

        cli.version(_package2["default"]);
        context$1$0.next = 23;
        break;

      case 15:
        context$1$0.next = 17;
        return cli.spawn(file);

      case 17:
        fly = context$1$0.sent;

        if (!list) {
          context$1$0.next = 22;
          break;
        }

        cli.list(fly.host, { bare: list === "bare" });
        context$1$0.next = 23;
        break;

      case 22:
        return context$1$0.abrupt("return", _reporter2["default"].call(fly).emit("fly_run", { path: fly.file }).start(tasks));

      case 23:
      case "end":
        return context$1$0.stop();
    }
  }, callee$0$0, this);
}))["catch"](function (e) {
  if (e.code === "ENOENT") (0, _flyUtil.error)("No Flyfile? See the Quickstart guide → git.io/fly-quick");else if (e.code === "INVALID_OPTION") (0, _flyUtil.error)("Unknown Flag: -" + e.key + ". Run fly -h to see the options.");else (0, _flyUtil.trace)(e);
});