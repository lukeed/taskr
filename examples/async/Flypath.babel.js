export default async function () {
  await this.clear("dist")
  await this
    .source("src/*.txt")
    .filter(s => this.defer(transform)(s, { time: 1000 }))
    .filter(s => s.toUpperCase())
    .target("dist")
}

function transform (source, options, cb) {
  setTimeout(() => {
    cb(null, source.split("").reverse().join(""))
  }, options.time)
}
