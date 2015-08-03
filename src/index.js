import co from "co"
import Parsec from "parsec"
import reporter from "./reporter"
import * as cli from "./cli/"
import { notifyUpdates, error, trace } from "fly-util"
import pkg from "../package"

co(function* () {
  notifyUpdates({ pkg })
  const { help, list, file, version, _: tasks } = Parsec
    .options("file", { default: "." })
    .options("list")
    .options("help")
    .options("version")
    .parse(process.argv, { strictMode: true })

  if (help) {
    cli.help()
  } else if (version) {
    cli.version(pkg)
  } else {
    const fly = yield cli.spawn(file)
    if (list) {
      cli.list(fly.host, { bare: list === "bare" })
    } else {
      return reporter
        .call(fly)
        .emit("fly_run", { path: fly.file })
        .start(tasks)
    }
  }
}).catch((e) => {
  if (e.code === "ENOENT")
    error(`No Flyfile? See the Quickstart guide → git.io/fly-quick`)
  else if (e.code === "INVALID_OPTION")
    error(`Unknown Flag: -${e.key}. Run fly -h to see the options.`)
  else trace(e)
})
