exports.default = ->
  yield @watch "src/**/*.coffee", "grind"

exports.grind = ->
  yield @clear "dist"
  yield
    @source "src/**/*.coffee"
    .coffee {}
    .target "dist"
