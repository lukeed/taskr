export function* first () {
  return { secret: 42 }
}

export function* second ({ secret }) {
  this.log(`The secret is ${secret}`)
}

export default function* () {
  yield this.start(["first", "second"])
}
