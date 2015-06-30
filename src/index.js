import Parsec from "parsec"
import { notifyUpdates, resolve } from "./util"
import reporter from "./reporter"
import cli from "./cli/"
import pkg from "../package"

/** @desc CLI Engine */
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
    const path = yield resolve({ file, name: "Flyfile" })
    if (list) {
      cli.list(path, { simple: list === "simple" })
    } else {
      reporter.call(yield cli.spawn(path)).start(tasks)
    }
  }
}
