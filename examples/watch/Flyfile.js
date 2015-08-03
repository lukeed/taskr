const paths = {
  scripts: "src/*.txt",
  dist: "dist"
}

export default function* () {
  yield this.watch(paths.scripts, "move")
}

export function* move () {
  yield this.clear(paths.dist)
  yield this
    .source(paths.scripts)
    .target(paths.dist)
}
