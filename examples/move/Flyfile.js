exports.default = function* () {
  yield this
    .source("fly")
    .filter(s => s.toUpperCase())
    .target("dist")
}
