"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.options = options;

var _parsec = require("parsec");

var _parsec2 = _interopRequireDefault(_parsec);

function options() {
  return (0, _parsec2["default"])(["f", "file", { "default": "." }], "list", "help", "version", ["_", "tasks"], function (key) {
    throw { code: "UNKNOWN_OPTION", key: key };
  });
}