const paths = {
  dist: "dist",
  scripts: ["src/*.babel.js", "src/*.js"]
}

export default function* () {
  this.watch(paths.scripts, ["build"])
}

export function* build () {
  yield this.clear(paths.dist)
  yield this
    .source(paths.scripts)
    .babel({ stage: 0 })
    .target(paths.dist)
}
