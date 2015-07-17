import Fly from "./fly"
import Parsec from "parsec"
import reporter from "./reporter"
import * as cli from "./cli/"
import { notifyUpdates, findPath as find } from "fly-util"
import pkg from "../package"

notifyUpdates({ pkg })

export default function* () {
  let { help, list, file, version, _: tasks } =
    Parsec.parse(process.argv)
      .options("file", { default: "./" })
      .options("list")
      .options("help")
      .options("version")

  if (help) {
    cli.help()
  } else if (version) {
    cli.version(pkg)
  } else {
    const path = yield find(file)
    if (list) {
      cli.list(path, { simple: list === "bare" })
    } else {
     return reporter
      .call(new Fly(yield cli.spawn(path)))
      .emit("fly_run", { path })
      .start(tasks)
    }
  }
}
