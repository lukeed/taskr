const paths = {
  src: "src/**/*.js",
  dist: "dist"
}

export function* main () {
  yield this
    .source(paths.src).eslint()
  yield this
    .source(paths.src)
    .babel({ optional: ["runtime"] })
    .target(paths.dist)
}
