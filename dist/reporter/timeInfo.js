/**
  Conditionally format task duration.
  @param  {Number} duration task duration in ms
  @param  {String} default scale for output
  @return {{duration, scale}}
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (duration) {
  var scale = arguments.length <= 1 || arguments[1] === undefined ? "ms" : arguments[1];

  return duration >= 1000 ? { duration: Math.round(duration / 1000 * 10) / 10, scale: "s" } : { duration: duration, scale: scale };
};

module.exports = exports["default"];