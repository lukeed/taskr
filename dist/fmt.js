"use strict";

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _clor = require("clor");

var _clor2 = _interopRequireDefault(_clor);

var _dateformat = require("dateformat");

var _dateformat2 = _interopRequireDefault(_dateformat);

/** Format and styles for fly reporters */
exports["default"] = _Object$assign(_clor2["default"], {
  complete: _clor2["default"].blue.bold("\"%s\""),
  start: _clor2["default"].bold.yellow("\"%s\""),
  title: _clor2["default"].bold.yellow("%s"),
  error: _clor2["default"].bold.red("%s"),
  path: _clor2["default"].underline.cyan("%s"),
  warn: _clor2["default"].bold.magenta("%s"),
  name: _clor2["default"].bold.yellow("\"%s\""),
  secs: _clor2["default"].green("%d %s"),
  // file: clor("\"").underline("%s")("\""),
  time: _clor2["default"].gray((0, _dateformat2["default"])(new Date(), "HH:MM:ss"))
});
module.exports = exports["default"];