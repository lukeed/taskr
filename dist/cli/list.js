"use strict";

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fmt = require("../fmt");

var _fmt2 = _interopRequireDefault(_fmt);

var _util = require("../util");

/**
  List all tasks available in the flyfile
  @param {Object} flyfile
  @param {Object} opts.simple Simple task listing.
  */

exports["default"] = function (flyfile, _ref) {
  var simple = _ref.simple;

  var host = require(flyfile);
  if (!simple) (0, _util.log)("\n" + _fmt2["default"].dim.bold("Available tasks"));
  _Object$keys(host).forEach(function (key) {
    var match = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec("" + host[key]);
    (0, _util.log)((simple ? "%s" : _fmt2["default"].title + "\t") + " " + (match ? match[0] : ""), key);
  });
  if (!simple) (0, _util.log)();
};

module.exports = exports["default"];