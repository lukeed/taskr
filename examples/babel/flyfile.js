export default function* () {
  yield this.watch("src/**/*.js", ["build"])
}

export function* build () {
  yield this.clear("dist")
  yield this
    .source("src/**/*.js")
    .babel({ presets: ["es2015"], sourceMaps: true })
    .concat("foobar.js")
    .target("dist")
}
