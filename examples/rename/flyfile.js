export default function* () {
  yield this
    .source("hello")
    .rename("bye")
    .target("")
}
