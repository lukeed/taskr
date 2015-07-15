import { stat, readdir } from "mz/fs"
import { exec } from "mz/child_process"
import { join } from "path"

export default function* () {
  this.warn("Installing dependencies to...")

  for (const sample of yield readdir(this.root)) {
    if (!(yield stat(sample)).isDirectory()) continue

    try {
      yield stat(join(sample, "node_modules"))
    } catch (_) {
      process.chdir(sample)
      this.warn(`→ ${process.cwd()}`)
      yield exec("npm i")
      process.chdir(this.root)
    }
  }
}
