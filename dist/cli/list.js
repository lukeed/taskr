"use strict";

var _Object$assign = require("babel-runtime/core-js/object/assign")["default"];

var _Object$keys = require("babel-runtime/core-js/object/keys")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = list;

var _fmt = require("../fmt");

var _fmt2 = _interopRequireDefault(_fmt);

var log = console.log.bind(console);
/**
  List all tasks available in the flyfile
  @param {Object} flyfile
  @param {Object} opts.simple Simple task listing.
 */

function list(flyfile, _ref) {
  var simple = _ref.simple;

  var host = require(flyfile);
  if (!simple) log("\n" + _fmt2["default"].dim.bold("Available tasks"));

  each(host instanceof Function ? _Object$assign(host, { "default": host }) : host, function (key, value) {
    var match = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec("" + value);
    var description = match ? match.pop() : "";
    log("" + (simple ? "%s" : "  " + _fmt2["default"].title + "\t" + description), key);
  });

  if (!simple) log();
}

function each(host, cb) {
  _Object$keys(host).forEach(function (key) {
    return cb(key, host[key]);
  });
}