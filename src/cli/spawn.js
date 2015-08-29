import Fly from "../fly"
import { join, dirname } from "path"
import { find, filter, bind, alert } from "fly-util"
/**
  Create a new Fly instance.
  @param {String} path to a flyfile
  @return {Fly} fly instance ✈
 */
export function* spawn (path, bind) {
  const file = yield find(path)
  return new Fly({
    file, host: require(file), plugins: getPlugins(dirname(file), bind)
  })
}
/**
  Load and return plugins in path/node_modules
  Bind require to compile plugins on the fly.
*/
function getPlugins (path, bind) {
  bind(null, { stage: 0, only: [/fly-[-\w]+\/[-\w]+\./, /[fF]lyfile\.js/] })
  return filter(load(join(path, "package")), (name) => {
    return { name, plugin: load(join(path, "node_modules", name)) }
  })
  function load (file) {
    try { return require(file) } catch (e) { alert(`${e.message}`) }
  }
}
