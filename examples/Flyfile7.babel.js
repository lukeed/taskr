export async function log () {
  this.log("Yay!")
}

export default async function () {
  await this.clear("coffee/dist")
  this.watch(
    ["babel/src/*.js", "map/src/*", "coffee/src/**/*.coffee"],
    ["lint", "test", "clear", "grind", "map", "babel"])
}

export async function map () {
  await this
    .source("map/src/*")
    .filter((s) => s.toUpperCase())
    .filter((s) => s.split("").reverse().join(""))
    .target("map/dist")
}

export async function babel () {
  await this
    .source("babel/src/*.js")
    .babel({ stage: 0 })
    .target("babel/dist")
}

export async function grind () {
  await this.clear("coffee/dist")
  await this
    .source("coffee/src/**/*.coffee")
    .coffee()
    .uglify()
    .concat("all.min.js")
    .target("coffee/dist/")
}

export async function lint () {
  await this
    .source("lint/*.js")
    .eslint()
}

export async function test () {
  await this
    .source("spec/*Spec.js")
    .mocha({ reporter: "list" })
}
