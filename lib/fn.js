/* eslint no-nested-ternary:0 */
"use strict"

const $ = exports

// @see http://stackoverflow.com/a/16608074
$.isObject = val => Boolean(val) && (val.constructor === Object)

$.isEmptyObj = val => $.isObject(val) && !Object.keys(val).length

$.toArray = val => (val === null || val === undefined) ? [] : Array.isArray(val) ? val : [val]

/**
 * Format a task's duration.
 * @param  {Array} arr  Output from `process.hrtime`
 * @return {String}
 */
$.formatTime = arr => {
	let unit = "ms"
	let num = Math.round(arr[1] / 1000000)
	if (arr[0] > 0) {
		unit = "s"
		num = (arr[0] + num / 1000).toFixed(2)
	}
	return `${num}${unit}`
}

/**
 * Get the current time!
 * @return {String}  Formatted as `[HH:mm:ss]`.
 */
const pad = n => (n < 10 ? "0" + n : n)
$.getTime = () => {
  const d = new Date()
  return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`
}

/**
 * Check if value is unique within the group. Modify if is not.
 * @param  {String} val  The value to check.
 * @param  {Array}  arr  The array of values to check against.
 * @return {String}      The unique value possibly incremented.
 */
$.valUniq = (val, arr) => {
	let n = 0
	let v = val
	while (arr.indexOf(v) !== -1) {
		n++
		v = val.concat(n)
	}
	return v
}

/**
 * Get a unique Set of Array values
 * @param  {Array} arr  The values to check
 * @return {Set}        The unique values
 */
$.getUniques = arr => {
	const len = arr.length
	const res = []
	let i = 0

	for (; i < len; i++) {
		const curr = arr[i]
		if (res.indexOf(curr) === -1) {
			res.push(curr)
		}
	}

	return res
}

function flat(arr, res) {
	const len = arr.length
	let i = 0
	for (; i < len; i++) {
		const cur = arr[i]
		Array.isArray(cur) ? flat(cur, res) : res.push(cur)
	}
	return res
}

$.flatten = arr => flat(arr, [])
