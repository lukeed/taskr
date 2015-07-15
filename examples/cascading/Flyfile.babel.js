export function* first () {
  return { secret: 42 }
}

export function* second ({ secret }) {
  return { secret }
}

export function* third ({ secret }) {
  this.log(`The secret is ${secret}`)
}

export default function* () {
  yield this.start(["first", "second", "third"])
}
