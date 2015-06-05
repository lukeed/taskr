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

/** @desc Format and styles for fly reporters */
exports["default"] = _Object$assign(_clor2["default"], {
  plugin: _clor2["default"].blue.bold("\"%s\""),
  error: _clor2["default"].bold.red("%s"),
  title: _clor2["default"].bold.green("%s"),
  task: _clor2["default"].bold.yellow("\"%s\""),
  secs: _clor2["default"].green("%d %s"),
  file: (0, _clor2["default"])("\"").underline("%s")("\""),
  time: _clor2["default"].gray((0, _dateformat2["default"])(new Date(), "HH:MM:ss"))
});
module.exports = exports["default"];