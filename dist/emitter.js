/** @desc Simple pub/sub pattern class */
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Emitter = (function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    this.events = [];
  }

  _createClass(Emitter, [{
    key: "on",

    /** @desc Subscribe to event. */
    value: function on(name, cb) {
      (this.events[name] = this.events[name] || []).push(cb);
      return this;
    }
  }, {
    key: "notify",

    /** @desc Notify subscribers. */
    value: function notify(name, obj) {
      var _this = this;

      (this.events[name] || []).forEach(function (event) {
        return event.call(_this, obj);
      });
      return this;
    }
  }]);

  return Emitter;
})();

exports["default"] = Emitter;
module.exports = exports["default"];