export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.js")
    .babel({ stage: 0, sourceMap: true })
    .uglify({})
    .concat("foobar.js")
    .target("dist")
}
