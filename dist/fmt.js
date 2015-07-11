"use strict";

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _clor = require("clor");

var _clor2 = _interopRequireDefault(_clor);

exports["default"] = _Object$assign(_clor2["default"], {
  complete: _clor2["default"].blue.bold("\"%s\""),
  start: _clor2["default"].bold.yellow("\"%s\""),
  title: _clor2["default"].bold.yellow("%s"),
  error: _clor2["default"].bold.red("%s"),
  path: _clor2["default"].underline.cyan("%s"),
  warn: _clor2["default"].bold.magenta("%s"),
  name: _clor2["default"].bold.yellow("\"%s\""),
  secs: _clor2["default"].green("%d %s")
});
module.exports = exports["default"];