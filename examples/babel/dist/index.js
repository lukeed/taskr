// Async stuff
"use strict";

function later() {
  return regeneratorRuntime.async(function later$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return regeneratorRuntime.awrap(new Promise(function (cb) {
          return setTimeout(cb, 1000);
        }));

      case 2:
      case "end":
        return context$1$0.stop();
    }
  }, null, this);
}

later().then(function () {
  return console.log("Out of Time!!");
});

var o = { prop: 0 };
Object.observe(o, function (changes) {
  return console.log(changes);
});
o.prop++;

console.log(Math.pow(20, 160), [0, null, NaN].includes(NaN));