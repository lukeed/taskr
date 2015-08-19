import { dirname, join } from "path"
import { writeFile } from "mz/fs"
import mkdirp from "mkdirp"

/** Write utility to help concat and target.
  @param {String} parent directory
  @param {String} base directory/file
  @param {Mixed} data
  @param {String} sourcemap
  @param {Function} promisified writer function
*/
export default function* ({ dir, base, data, map, write = writeFile } = {}) {
  const file = join(dir, base)
  mkdirp.sync(dirname(file))
  yield write(file, data)
  if (map) writeFile(`${file}.map`, JSON.stringify(
    Object.assign(map, { file: base })))
}
