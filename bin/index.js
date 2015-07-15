#!/bin/sh
":" //# comment; exec /usr/bin/env node --harmony --harmony_arrow_functions "$0" "$@"

if (!require("yieldables")) throw new Error("Fly requires node >= 0.11")

require("co")(require("../dist")).catch(function (e) {
  if (e.code === "ENOENT") {
    console.error(
      "Got Flyfile? For more info about running Fly," + 
      "see the Quickstart guide → git.io/fly-quick")
  } else {
    require("../dist/util").trace(e)
  }
})
