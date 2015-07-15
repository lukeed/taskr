const options = [{
  parallel: false,
  value: { dist: "dist/seq" }
}, {
  parallel: true,
  value: { dist: "dist/con" }
}]

export default function* () {
  yield this.clear("dist")
  for (const opt of options)
    yield this.start(["first", "second", "third"], opt)
}

export function* first ({ dist }) {
  yield this
    .source("src/*.1")
    .filter(s => this.defer(transform)(s, { time: 500 }))
    .concat("all.1.min")
    .target(dist)
}

export function* second ({ dist }) {
  yield this
    .source("src/*.2")
    .filter(s => this.defer(transform)(s, { time: 500 }))
    .concat("all.2.min")
    .target(dist)
}

export function* third ({ dist }) {
  yield this
    .source("src/*.3")
    .filter(s => this.defer(transform)(s, { time: 500 }))
    .concat("all.3.min")
    .target(dist)
}

function transform (source, options, cb) {
  // Add a delay to simulate a lengthy transform.
  setTimeout(() => cb(null, source), options.time)
}
