import clor from "clor"
import date from "dateformat"

/** @desc Format and styles for fly reporters */
export default Object.assign(clor, {
  plugin: clor.blue.bold("\"%s\""),
  error: clor.bold.red("%s"),
  title: clor.bold.green("%s"),
  task: clor.bold.yellow("\"%s\""),
  secs: clor.green("%d %s"),
  file: clor("\"").underline("%s")("\""),
  time: clor.gray(date(new Date(), "HH:MM:ss"))
})
