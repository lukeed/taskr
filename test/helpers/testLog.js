export function test (f, handler) {
  const ctx = this
  const log = console.log
  console.log = function _log () {
    console.log = log
    if (handler.apply(ctx, Array.prototype
      .slice.call(arguments))) console.log = _log
  }
  f.call()
  console.log = log
}
