"use strict";

var _regeneratorRuntime = require("babel-runtime/regenerator")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawn = spawn;
var marked0$0 = [spawn].map(_regeneratorRuntime.mark);

var _fly = require("../fly");

var _fly2 = _interopRequireDefault(_fly);

var _path = require("path");

var _flyUtil = require("fly-util");

/**
  Create a new Fly instance.
  @param {String} path to a flyfile
  @return {Fly} fly instance ✈
 */

function spawn(path) {
  var file;
  return _regeneratorRuntime.wrap(function spawn$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return (0, _flyUtil.find)(path, _flyUtil.bind);

      case 2:
        file = context$1$0.sent;
        return context$1$0.abrupt("return", new _fly2["default"]({
          file: file, host: require(file), plugins: getPlugins((0, _path.dirname)(file))
        }));

      case 4:
      case "end":
        return context$1$0.stop();
    }
  }, marked0$0[0], this);
}

/**
  Load and return plugins in path/node_modules
  Bind require to compile plugins on the fly.
*/
function getPlugins(path) {
  (0, _flyUtil.bind)(null, { stage: 0, only: [/fly-[-\w]+\/[-\w]+\./, /[fF]lyfile\.js/] });
  return (0, _flyUtil.filter)(load((0, _path.join)(path, "package")), function (name) {
    return { name: name, plugin: load((0, _path.join)(path, "node_modules", name)) };
  });
  function load(file) {
    try {
      return require(file);
    } catch (e) {
      (0, _flyUtil.alert)("" + e.message);
    }
  }
}