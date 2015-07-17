#!/bin/sh
":" //# comment; exec /usr/bin/env node --harmony --harmony_arrow_functions "$0" "$@"

if (!require("yieldables"))
  throw new Error("Fly requires iojs || node >= 0.11")

require("co")(require("../dist")).catch(function (e) {
  if (e.code === "ENOENT") {
    console.error(
      "\nGot a Flyfile? For more info on running Fly," +
      "\nsee the Quickstart guide → git.io/fly-quick\n")
  } else {
    require("fly-util").trace(e)
  }
})
