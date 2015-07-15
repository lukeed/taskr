"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.help = help;

var _fmt = require("../fmt");

var _fmt2 = _interopRequireDefault(_fmt);

function help() {
  console.log("\nUsage\n  fly [options] [tasks]\n\nOptions\n  -h  --help      Display this help.\n  -f  --file      Use an alternate Flyfile.\n  -l  --list      Display available tasks.\n  -v  --version   Display version.\n  ".replace(/(\s--)(.*?)\s/g, "" + _fmt2["default"].dim.bold("$1") + _fmt2["default"].bold("$2")).replace(/(-)(.\s)/g, "" + _fmt2["default"].dim.bold("$1") + _fmt2["default"].bold("$2")).replace(/(^Options|^Usage)/gm, "" + _fmt2["default"].dim.bold("$1")).replace(/([_\/\\]|[_,])/gm, "" + _fmt2["default"].dim.bold("$1")));
}