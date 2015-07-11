export function* log () {
  this.log("Yay!")
}

export default function* () {
  this.watch(
    ["babel/src/*.js", "map/src/*", "coffee/src/**/*.coffee"],
    [ "lint", "test", "clear", "grind", "map", "babel"])
}

export function* clear () {
  yield this.clear("coffee/dist")
}

export function* map () {
  yield this
    .source("map/src/*")
    .filter((s) => s.toUpperCase())
    .filter((s) => s.split("").reverse().join(""))
    .target("map/dist")
}

export function* babel () {
  yield this
    .source("babel/src/*.js")
    .babel({ stage: 0 })
    .target("babel/dist")
}

export function* grind () {
  yield this.clear("coffee/dist")
  yield this
    .source("coffee/src/**/*.coffee")
    .coffee()
    .uglify()
    .concat("all.min.js")
    .target("coffee/dist/")
}

export function* lint () {
  yield this
    .source("lint/*.js")
    .eslint()
}

export function* test () {
  yield this
    .source("spec/*Spec.js")
    .mocha({ reporter: "list" })
}

export function* jade () {
  this.log("hi")
  yield this
    .source("jade/*.jade")
    .jade()
    .target(["jade/dist"], { parallel: true })
  // yield this
  //   .options({ parallel: false })
  //   .source2("plain/*.x", "plain/*.y")
  //   .filter((s) => "|||||" + s.toUpperCase())
  //   .filter((s) => "*****" + s)
  //   .jade(42)
  //   .concat("all.min")
  //   .target2("plain/dist")//.jade().target("jade/dist")
}

export function* move () {
  yield this.source("plain/a.x").target("plain/dump")
}
