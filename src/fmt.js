import clor from "clor"

export default Object.assign(clor, {
  complete: clor.blue.bold("\"%s\""),
  start: clor.bold.yellow("\"%s\""),
  title: clor.bold.yellow("%s"),
  error: clor.bold.red("%s"),
  path: clor.underline.cyan("%s"),
  warn: clor.bold.magenta("%s"),
  name: clor.bold.yellow("\"%s\""),
  secs: clor.green("%d %s")
})
