
"use strict";require("earlgrey-runtime/5");var $targ$0 = undefined;var $targ$1 = undefined;var $targ$2 = undefined;var paths$0 = undefined;var main$0 = undefined;var clear$0 = undefined;var scripts$0 = undefined;paths$0 = { scripts: ["earl/src/**/*.eg"] };main$0 = regeneratorRuntime.mark(function main() {
  var _this = this;

  return regeneratorRuntime.wrap(function main$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _this.tasks.clear();

      case 2:
        context$1$0.next = 4;
        return _this.tasks.scripts();

      case 4:
        return context$1$0.abrupt("return", context$1$0.sent);

      case 5:
      case "end":
        return context$1$0.stop();
    }
  }, main, this);
});clear$0 = regeneratorRuntime.mark(function clear() {
  var _this = this;

  return regeneratorRuntime.wrap(function clear$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _this.clear("build");

      case 2:
        return context$1$0.abrupt("return", context$1$0.sent);

      case 3:
      case "end":
        return context$1$0.stop();
    }
  }, clear, this);
});scripts$0 = regeneratorRuntime.mark(function scripts() {
  var _this = this;

  var $it$3, $it$2, $it$1, $it$0;
  return regeneratorRuntime.wrap(function scripts$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        $it$3 = undefined;
        $it$2 = undefined;
        $it$1 = undefined;
        $it$0 = undefined;
        context$1$0.next = 6;
        return ($it$0 = _this, $it$1 = $it$0.source(paths$0.scripts[0]), $it$2 = $it$1.earl(), $it$3 = $it$2.concat("all.js"), $it$3.target("earl/build/js"));

      case 6:
        return context$1$0.abrupt("return", context$1$0.sent);

      case 7:
      case "end":
        return context$1$0.stop();
    }
  }, scripts, this);
});$targ$0 = main$0;exports.main = $targ$0;$targ$1 = clear$0;exports.clear = $targ$1;$targ$2 = scripts$0;exports.scripts = $targ$2;void 0;
//# sourceMappingURL=Flyfile.js.map
