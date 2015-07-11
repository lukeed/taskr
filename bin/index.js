#!/bin/sh
":" //# comment; exec /usr/bin/env node --harmony --harmony_arrow_functions "$0" "$@"

if (!require("yieldables")) throw new Error("Fly requires node >= 0.11")

require("co")(require("../dist")).catch(function (e) {
  if (e.code === "ENOENT") {
    console.error(
      "Your project is missing a Flyfile. For more info about\n" +
      "running Fly, see the Fly Start guide: git.io/fly-start")
  } else {
    require("../dist/util").trace(e)
  }
})
