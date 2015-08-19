exports.default = ->
  yield @clear "dist"
  yield
    @source "src/**/*.coffee"
    .coffee { sourceMap: true }
    .target "dist"
