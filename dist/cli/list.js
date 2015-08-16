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

/**
  List tasks in a fly instance.
  @param {Object} fly instance
  @param {{ bare:Boolean }} unstyled
 */

function list(host, _ref) {
  var bare = _ref.bare;

  if (!bare) console.log("\n" + _fmt2["default"].dim.bold("Available tasks"));
  each(host instanceof Function ? _Object$assign(host, { "default": host }) : host, function (task, desc) {
    return console.log("" + (bare ? "%s" : "  " + _fmt2["default"].title + "\t" + desc), task);
  });
  if (!bare) console.log();
}

/**
  Run handler for each task and description field in host.
 */
function each(host, handler) {
  _Object$keys(host).forEach(function (task) {
    var desc = /^\s*\/\*\*\s*@desc\s+(.*)\s*\*\//gm.exec("" + host[task]);
    handler(task, desc ? desc.pop() : "");
  });
}