exports.log = function* () {
  this.log("Yay!")
}

exports.default = function* () {
  this.watch(
    ["babel/src/*.js", "map/src/*", "coffee/src/**/*.coffee"],
    ["lint", "test", "clear", "grind", "map", "babel"])
}

exports.clear = function* () {
  yield this.clear("coffee/dist")
}

exports.map = function* () {
  yield this
    .source("map/src/*")
    .filter((s) => s.toUpperCase())
    .filter((s) => s.split("").reverse().join(""))
    .target("map/dist")
}

exports.babel = function* () {
  yield this
    .source("babel/src/*.js")
    .babel({ stage: 0 })
    .target("babel/dist")
}

exports.grind = function* () {
  yield this.clear("coffee/dist")
  yield this
    .source("coffee/src/**/*.coffee")
    .coffee()
    .uglify()
    .concat("all.min.js")
    .target("coffee/dist/")
}

exports.lint = function* () {
  yield this
    .source("lint/*.js")
    .eslint()
}

exports.test = function* () {
  yield this
    .source("spec/*Spec.js")
    .mocha({ reporter: "list" })
}

exports.styles = function* () {
  /** @desc Hello */
  yield this
    .source("styles/*.styl")
    .stylus()
    .target("styles/dist/")
}
