const paths = {
  src: "src/**/*.js",
  dist: "dist"
}

exports.main = function* () {
  yield this
    .source(paths.src).eslint()
  yield this
    .source(paths.src)
    .babel({ optional: ["runtime"] })
    .target(paths.dist)
}
