"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require("../util");

exports["default"] = function (pkg) {
  (0, _util.log)(pkg.name + ", " + pkg.version);
};

module.exports = exports["default"];