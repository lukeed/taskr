export default function* () {
  yield this.clear("dist")
  yield this.source("src/fly.png").target("dist")
}
