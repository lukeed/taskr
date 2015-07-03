export function* log () {
  this.log("Yay!")
}

export function* main () {
  this.watch(
    ["babel/src/*.js", "map/src/*", "coffee/src/**/*.coffee"],
    ["lint", "test", "clear", "grind", "map", "babel"])
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
