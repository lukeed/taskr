module.exports = function (parent) {
  function child () { parent.call(this) }
  child.prototype = Object.create(parent.prototype)
  child.prototype.constructor = parent
  return child
}
