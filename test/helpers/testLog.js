const slice = Array.prototype.slice

module.exports = function () {
  return testLog.bind(this)
}

module.exports.test = test

function test (f, handler) {
  const ctx = this
  const log = console.log
  console.log = function _log () {
    console.log = log
    if (handler.apply(ctx, slice.call(arguments))) console.log = _log
  }
  f.call()
  console.log = log
}
