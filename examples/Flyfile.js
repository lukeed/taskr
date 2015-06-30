exports.log = function* () {
  this.log("Yay!")
}

exports.default = function* () {
  yield this.tasks.map()
  yield this.tasks.babel()
  yield this.tasks.grind()
  yield this.tasks.lint()
  yield this.tasks.test()
  this.watch(["babel/src/*.js", "map/src/*"])
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
