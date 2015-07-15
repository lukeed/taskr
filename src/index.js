import Fly from "./fly"
import Parsec from "parsec"
import reporter from "./reporter"
import * as cli from "./cli/"
import { trace, notifyUpdates, findPath as find } from "fly-util"
import pkg from "../package"

notifyUpdates({ pkg })

let { help, list, file, version, _: tasks } =
  Parsec.parse(process.argv)
    .options("file", { default: "./" })
    .options("list")
    .options("help")
    .options("version")

export default function* () {
  if (help) {
    cli.help()
  } else if (version) {
    cli.version(pkg)
  } else {
    const path = yield find(file)
    if (list) {
      cli.list(path, { simple: list === "simple" })
    } else {
     return reporter
        .call(new Fly(yield cli.spawn(path)))
        .emit("fly_run", { path })
        .start(tasks)
    }
  }
}
