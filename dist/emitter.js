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

  /**
   * Listen to an event.
   * @param {String} name of event to observe
   * @param {Function} handler
   */

  _createClass(Emitter, [{
    key: "on",
    value: function on(name, cb) {
      (this.events[name] = this.events[name] || []).push(cb);
      return this;
    }

    /**
     * Emit an event to listeners.
     * @param {String} name of event to emit
     * @param {Object} data to send
     */
  }, {
    key: "emit",
    value: function emit(name, obj) {
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