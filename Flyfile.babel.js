const paths = {
  src: "src/**/*.js",
  dist: "dist"
}

export default function* () {
  this.log("This the default task.")
}

export function* main () {
  yield this
    .source(paths.src).eslint()
  yield this
    .source(paths.src)
    .babel({ optional: ["runtime"], modules: "common" })
    .target(paths.dist)
}
