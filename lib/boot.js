"use strict"

const Promise = require('bluebird')

function deferAll(obj) {
  const o = {}
  for (const k in obj) {
    o[k] = function () {
      return this.then(() => obj[k].apply(obj, arguments))
    }
  }
  return o
}

function wrapAll(obj) {
  const o = {}
  for (const k in obj) {
    if (!(obj[k].call)) continue // only functions
    o[k] = wrap(obj[k]).bind(obj)
  }
  return o
}

function wrap(fn) {
  return function () {
    return fn.apply(this, arguments)
  }
}

function liquidate(obj) {
  const promised = wrapAll(obj)
  // merge with Promise API
  Object.assign(Promise.prototype, deferAll(promised))
  return promised
}

module.exports = liquidate
