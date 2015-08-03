export default function* () {
  yield this.clear("dist")
  yield this
    .source("text")
    .filter((s) => s.replace(/(\w+)\s(\w+)/g, "$2 $1"))
    .target("dist/swap")
}
