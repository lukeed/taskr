import clor from "clor"
import date from "dateformat"

/** @desc Format and styles for fly reporters */
export default Object.assign(clor, {
  complete: clor.blue.bold("\"%s\""),
  start: clor.bold.yellow("\"%s\""),
  error: clor.bold.red("%s"),
  path: clor.underline.cyan("%s"),
  warn: clor.bold.magenta("%s"),
  name: clor.bold.yellow("\"%s\""),
  secs: clor.green("%d %s"),
  // file: clor("\"").underline("%s")("\""),
  time: clor.gray(date(new Date(), "HH:MM:ss"))
})
