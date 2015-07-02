"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fmt = require("./fmt");

var _fmt2 = _interopRequireDefault(_fmt);

var _util = require("./util");

/** @desc Bound to an emitter (fly) object observing triggered events */

exports["default"] = function () {
  this.on("fly_start", function () {
    return (0, _util.log)("[" + _fmt2["default"].time + "] " + _fmt2["default"].title, "Starting Fly...");
  }).on("flyfile_not_found", function (_ref) {
    var error = _ref.error;
    return (0, _util.log)("No Flyfile Error: " + _fmt2["default"].error, error);
  }).on("plugin_load", function (_ref2) {
    var plugin = _ref2.plugin;
    return (0, _util.log)("[" + _fmt2["default"].time + "] Loading plugin " + _fmt2["default"].plugin, plugin);
  }).on("plugin_run", function (_ref3) {
    var plugin = _ref3.plugin;
    return (0, _util.log)("[" + _fmt2["default"].time + "] Running " + _fmt2["default"].plugin, plugin);
  }).on("plugin_error", function (_ref4) {
    var plugin = _ref4.plugin;
    var error = _ref4.error;
    return (0, _util.log)("[" + _fmt2["default"].time + "] " + _fmt2["default"].plugin + " failed due to " + _fmt2["default"].error, plugin, error);
  }).on("task_skip", function (_ref5) {
    var task = _ref5.task;
    return (0, _util.log)(_fmt2["default"].error + " is a function reserved by Fly.", task);
  }).on("task_start", function (_ref6) {
    var task = _ref6.task;
    return (0, _util.log)("[" + _fmt2["default"].time + "] Running " + _fmt2["default"].task, task);
  }).on("task_error", function (_ref7) {
    var task = _ref7.task;
    var error = _ref7.error;
    return (0, _util.log)("[" + _fmt2["default"].time + "] " + _fmt2["default"].task + " failed due to " + _fmt2["default"].error, task, error);
  }).on("task_complete", function (_ref8) {
    var task = _ref8.task;
    var duration = _ref8.duration;
    return (0, _util.log)("[" + _fmt2["default"].time + "] Completed " + _fmt2["default"].task + " in " + _fmt2["default"].secs, task, duration, "ms");
  }).on("task_not_found", function (_ref9) {
    var task = _ref9.task;
    return (0, _util.log)("[" + _fmt2["default"].time + "] " + _fmt2["default"].error + " not found in Flyfile.", task);
  }).on("file_created", function (_ref10) {
    var file = _ref10.file;
    return (0, _util.log)("[" + _fmt2["default"].time + "] File " + _fmt2["default"].file + " created.", file);
  });

  return this;
};

module.exports = exports["default"];