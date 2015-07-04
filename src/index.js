import Parsec from "parsec"
import { notifyUpdates, find } from "./util"
import reporter from "./reporter"
import cli from "./cli/"
import pkg from "../package"

export default function* () {
  notifyUpdates({ pkg })

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
    const path = yield find({ file })
    if (list) {
      cli.list(path, { simple: list === "simple" })
    } else {
      reporter
        .call(yield cli.spawn(path))
        .notify("fly_run", { path })
        .start(tasks)
    }
  }
}
