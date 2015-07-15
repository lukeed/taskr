export default function* () {
  yield this.source("*.js").eslint()
}
