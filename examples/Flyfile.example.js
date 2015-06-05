var paths = {
  scripts: ["client/js/**/*.coffee", "!client/external/**/*.coffee"],
  images: "client/img/**/*"
}

exports.default = function* () {
  yield this.tasks.clean()
  yield this.tasks.scripts()
  yield this.tasks.images()
  yield this.watch([paths.scripts, paths.images])
}

exports.clean = function* () {
  yield this.rimraf("build")
}

exports.scripts = function* () {
  yield this
    .source(paths.scripts)
    .coffee({/* options */})
    .uglify({/* options */})
    .concat("all.min.js")
    .target("build/js")
}

exports.images = function* () {
  yield this
    .source(paths.images)
    .imagemin({/* options */})
    .target("build/img")
}
