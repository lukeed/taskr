export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.js")
    .babel({ stage: 0 })
    .uglify()
    .concat("all.min.js")
    .target("dist")
}
