export default function* () {
  yield this.source("*Spec.js").mocha({ reporter: "nyan" })
}
