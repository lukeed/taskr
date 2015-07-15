import fmt from "../fmt"

export function help () {
  console.log(`
Usage
  fly [options] [tasks]

Options
  -h  --help      Display this help.
  -f  --file      Use an alternate Flyfile.
  -l  --list      Display available tasks.
  -v  --version   Display version.
  `
  .replace(/(\s--)(.*?)\s/g, `${fmt.dim.bold("$1")}${fmt.bold("$2")}`)
  .replace(/(-)(.\s)/g, `${fmt.dim.bold("$1")}${fmt.bold("$2")}`)
  .replace(/(^Options|^Usage)/gm, `${fmt.dim.bold("$1")}`)
  .replace(/([_\/\\]|[_,])/gm, `${fmt.dim.bold("$1")}`)
  )
}
