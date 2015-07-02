import Parsec from "parsec"
import { jsVariants } from "interpret"
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
    const ext = path.split(".")[path.split(".").length - 1]
    const modules = jsVariants["." + ext]
    let extModule = modules
    if(Array.isArray(modules)) {
      extModule = modules[0]
    }
    require(extModule)
    if (list) {
      cli.list(path, { simple: list === "simple" })
    } else {
      reporter.call(yield cli.spawn(path)).start(tasks)
    }
  }
}
