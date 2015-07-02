const paths = {
  scripts: ["src/**/*.js", "!src/ignore/**/*.js"]
}

exports.default = function* () {
  yield this.tasks.clean()
  yield this.tasks.scripts()
  yield this.watch([paths.scripts])
}

exports.clear = function* () {
  yield this.clear("build")
}

exports.scripts = function* () {
  yield this
    .source(paths.scripts)
    .babel({/* options */})
    .uglify({/* options */})
    .concat("all.min.js")
    .target("build/js")
}
