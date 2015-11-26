export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.js")
    .babel({ presets: ["es2015"], sourceMap: true })
    // .uglify({})
    .concat("out.js")
    .target("dist")
}
