export default async function () {
  const transform = (data, options, cb) => {
    setTimeout(() => {
      cb(null, `${data}`.split("").reverse().join("").toUpperCase())
    }, options.time)
  }
  await this.clear("dist")
  await this
    .source("src/*.txt")
    .filter(data => this.defer(transform)(data, { time: 1000 }))
    .target("dist")
}
