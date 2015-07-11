"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _flyUtil = require("fly-util");

exports["default"] = function (pkg) {
  (0, _flyUtil.log)(pkg.name + ", " + pkg.version);
};

module.exports = exports["default"];