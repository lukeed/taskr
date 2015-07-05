const paths = {
  src: "src/**/*.js",
  dist: "dist"
}

module.exports = function* () {
  yield this
    .source(paths.src).eslint()
  yield this
    .source(paths.src)
    .babel({ optional: ["runtime"] })
    .target(paths.dist)
}
