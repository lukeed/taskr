export default function* () {
  yield this.clear("dist")
  yield this
    .source("src/*.jade")
    .jade()
    .target("dist")
}
