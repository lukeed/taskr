"use strict";

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fmt = require("./fmt");

var _fmt2 = _interopRequireDefault(_fmt);

var _flyUtil = require("fly-util");

exports["default"] = function () {
  this.on("fly_run", function (_ref) {
    var path = _ref.path;
    return (0, _flyUtil.log)("Flying with " + _fmt2["default"].path + "...", path);
  }).on("flyfile_not_found", function (_ref2) {
    var error = _ref2.error;
    return (0, _flyUtil.log)("No Flyfile Error: " + _fmt2["default"].error, error);
  }).on("fly_watch", function () {
    return (0, _flyUtil.log)("" + _fmt2["default"].warn, "Watching files...");
  }).on("plugin_load", function (_ref3) {
    var plugin = _ref3.plugin;
    return (0, _flyUtil.log)("Loading plugin " + _fmt2["default"].name, plugin);
  }).on("plugin_error", function (_ref4) {
    var plugin = _ref4.plugin;
    var error = _ref4.error;
    return (0, _flyUtil.log)(_fmt2["default"].error + " failed due to " + _fmt2["default"].error, plugin, error);
  }).on("task_error", function (_ref5) {
    var task = _ref5.task;
    var error = _ref5.error;
    return (0, _flyUtil.log)(_fmt2["default"].error + " failed due to " + _fmt2["default"].error, task, error);
  }).on("task_start", function (_ref6) {
    var task = _ref6.task;
    return (0, _flyUtil.log)("Starting " + _fmt2["default"].start, task);
  }).on("task_complete", function (_ref7) {
    var task = _ref7.task;
    var duration = _ref7.duration;

    var time = timeInfo(duration);
    (0, _flyUtil.log)("Finished " + _fmt2["default"].complete + " in " + _fmt2["default"].secs, task, time.duration, time.scale);
  }).on("task_not_found", function (_ref8) {
    var task = _ref8.task;
    return (0, _flyUtil.log)(_fmt2["default"].error + " not found in Flyfile.", task);
  });

  return this;
};

/**
 * conditionally format task duration
 * @param  {Number} duration task duration in ms
 * @param  {String} scale default scale for output
 * @return {Object} time information
 */
function timeInfo(duration) {
  var scale = arguments.length <= 1 || arguments[1] === undefined ? "ms" : arguments[1];

  return duration >= 1000 ? { duration: Math.round(duration / 1000 * 10) / 10, scale: "s" } : { duration: duration, scale: scale };
}
module.exports = exports["default"];