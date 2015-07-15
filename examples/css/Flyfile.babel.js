export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.scss")
    .sass({ outputStyle: "compressed" })
    .target("dist")
  yield this
    .source("src/*.less")
    .less({ compress: true })
    .target("dist")
  yield this
    .source("src/*.styl")
    .stylus({ compress: true })
    .target("dist")
}
