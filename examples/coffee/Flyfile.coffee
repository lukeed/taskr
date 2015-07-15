exports.default = ->
  yield @clear "dist"
  @watch "src/**/*.coffee", ["grind"]

exports.grind = ->
  yield
    @source "src/**/*.coffee"
    .coffee {}
    .target "dist"
