const paths = {
  scripts: ["src/**/*.js", "!src/ignore/**/*.js"]
}

exports.default = function* () {
  this.watch([paths.scripts], ["clear", "scripts"])
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
