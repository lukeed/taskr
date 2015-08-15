import parse from "parsec"
export function options () {
  return parse(
    ["f", "file", { default: "." }],
    "list",
    "help",
    "version",
    ["_", "tasks"], (key) => { throw { code: "UNKNOWN_OPTION", key } })
}
