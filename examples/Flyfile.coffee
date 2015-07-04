exports.main = ->
  yield @clear "coffee/dist"
  @watch(
    ["babel/src/*.js", "map/src/*", "coffee/src/**/*.coffee"],
    ["lint", "test", "grind", "map", "babel"])

exports.map = ->
  yield @source([[[[["map/src/*"]]]]])
  .filter((s) => s.toUpperCase())
  .filter((s) => s.split("").reverse().join(""))
  .target([[[[[["map/dist"]]]]]])

exports.babel = ->
  yield @source("babel/src/*.js")
  .babel({ stage: 0 })
  .target("babel/dist")

exports.grind = ->
  yield @clear "coffee/dist"
  yield @source("coffee/src/**/*.coffee")
  .coffee()
  .uglify()
  .concat("all.min.js")
  .target("coffee/dist/")

exports.lint = ->
  yield @source("lint/*.js").eslint()

exports.test = ->
  yield @source("spec/*Spec.js").mocha({ reporter: "list" })
