const paths = {
  src: "src/**/*.js",
  dist: "dist"
}

export default function* () {
  yield this
    .source(paths.src).eslint()

  yield this.clear(paths.dist)
  yield this.log("Building Fly...")
    .source(paths.src)
    .babel({ presets: ["es2015", "stage-3"] })
    .target(paths.dist)
}
