export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.js")
    .babel({ stage: 0 })
    .uglify({})
    .concat("foobar.js")
    .target("dist")
}
