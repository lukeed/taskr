const paths = {
  src: "src/**/*.js",
  dist: "dist"
}

export default function* () {
  yield this.clear(paths.dist)
  yield this
    .source(paths.src).eslint()
  yield this.log("Building Fly...")
    .source(paths.src)
    .babel({ optional: ["runtime"], modules: "common" })
    .target(paths.dist)
}
