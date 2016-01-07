export default function* () {
  yield this.watch("src/**/*.js", ["build"])
}

export function* build () {
  yield this.clear("dist")
  yield this
    .source("src/**/*.js")
    .babel({ stage: 0, sourceMaps: true })
    .concat("foobar.js")
    .target("dist")
}
