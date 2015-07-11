import { log } from "fly-util"

export default function (pkg) {
  log(`${pkg.name}, ${pkg.version}`)
}
