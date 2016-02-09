import clor from "clor"
import datefmt from "dateformat"
import pretty from "prettyjson"
import debug from "debug"
const _ = debug("fly:log")

/**
  Apply args to console[method] and add a date stamp.
  Bind `this` to an object with the following options
  @prop {Color String} date stamp color
  @prop {String} console method to use
  @prop {[String]} custom style to append to args
*/
export function stamp (...args) {
  if (process.env.DEBUG) {
    _.apply(_, args)
  } else {
    process.stdout.write(`[${clor[this.color](
      datefmt(new Date(), "HH:MM:ss"))}] `)
    console[this.method].apply(console, this.custom
      ? [this.custom].concat(args) : args)
  }
}

/**
  Log utilities.
*/
export function log (...args) {
  stamp.apply({ method: "log", color: "magenta" }, args)
  return this
}

export function error (...args) {
  stamp.apply({ method: "error", color: "red" }, args)
  return this
}

export function alert (...args) {
  if (process.env.VERBOSE)
    stamp.apply({
      custom: `${clor.yellow.bold("%s")}`,
      method: "log",
      color: "yellow"
    }, args)
  return this
}

/**
  prettyjson wrapper and stack tracer.
  @param {Object} error object
*/
export function trace (e) {
  console.error(pretty.render(e)
    .replace(/(\sFunction|\sObject)\./g, `${clor.blue("$1")}.`)
    .replace(/\((~?\/.*)\)/g, `(${clor.gray("$1")})`)
    .replace(/:([0-9]*):([0-9]*)/g, ` ${clor.yellow("$1")}:${clor.yellow("$2")}`)
    .replace(new RegExp(process.env.HOME, "g"), "~")
  )
}
