export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.scss")
    .sass({
      outputStyle: "compressed",
      includePaths: ["src/imports"]
    })
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
