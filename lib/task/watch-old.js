"use strict";
const flatten = require("flatten");
const arrify = require("arrify");
const co = require("bluebird").coroutine;

const types = { add: "added", change: "changed", unlink: "removed" };

module.exports = co(function*(globs, tasks, opts) {
  globs = flatten(arrify(globs));
  tasks = arrify(tasks);
  opts = opts || {};

  // announce start
  this.emit("fly_watch");

  // do first run-through
  yield this.serial(tasks, opts);

  return require("chokidar")
    .watch(globs, { ignoreInitial: 1 })
    .on("error", this.$.error)
    .on("all", (event, filepath) => {
      // stash previous globs; used within `target`
      this._.prevs = globs;

      // broadcast
      this.emit("fly_watch_event", { action: types[event], file: filepath });

      // pass single file to task params
      opts.src = filepath;

      // re-run task chain
      return this.serial(tasks, opts);
    });
});
