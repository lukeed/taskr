const co = require("co")
const test = require("tape").test
const tlog = require("./helpers/testLog").test
const Fly = require("../dist/fly")
const cli = require("../dist/cli")
const pkg = require("../package")
const join = require("path").join

test("✈  cli", (t) => {
  t.ok(cli !== undefined, "is defined")
  Array.prototype.concat(["help", "list", "spawn", "version"])
  .forEach((command) => {
    t.equal(command in cli, true, command + " is defined")
  })
  t.end()
})

test("✈  cli.version", (t) => {
  const flypath = join(process.cwd(), "test", "fixtures", "flyfile.js")
  tlog.call(t, () => cli.version(pkg), (actual) => {
    t.equal(actual, pkg.name + ", " + pkg.version, "log fly version")
  })
  t.end()
})

test("✈  cli.help", (t) => {
  const flypath = join(process.cwd(), "test", "fixtures", "flyfile.js")
  tlog.call(t, cli.help, (actual) => {
    t.equal(actual, "\n\x1b[2m\x1b[1mUsage\x1b[0m\x1b[0m\n  fly [options] [tasks]\n\n\x1b[2m\x1b[1mOptions\x1b[0m\x1b[0m\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[0m\x1b[1mh \x1b[0m\x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[0m\x1b[1mhelp\x1b[0m\x1b[0m     Display this help.\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[0m\x1b[1mf \x1b[0m\x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[0m\x1b[1mfile\x1b[0m\x1b[0m     Use an alternate Flyfile.\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[0m\x1b[1ml \x1b[0m\x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[0m\x1b[1mlist\x1b[0m\x1b[0m     Display available tasks.\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[0m\x1b[1mv \x1b[0m\x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[0m\x1b[1mversion\x1b[0m\x1b[0m  Display version.\n  ",
      "show fly help")
  })
  t.end()
})

test("✈  cli.list", (t) => {
  const message = "list tasks in a fly instance"
  const flypath = join(process.cwd(), "test", "fixtures", "flyfile.js")
  Array.prototype.concat([true, false]).forEach((bare) => {
    tlog.call(t, () => cli.list(require(flypath), { bare: bare }),
    (actual, key) => {
      if (!bare && actual === '\n\x1b[2m\x1b[1mAvailable tasks\x1b[0m\x1b[0m')
        return true
      switch (key) {
        case "a":
          return true
        case "b":
          return true
        case "c":
          t.ok(true, "message / bare " + bare)
          break
        default:
          t.ok(false, message)
      }
    })
  })
  t.end()
})

test("✈  cli.spawn", (t) => {
  process.env.SILENT = true
  t.plan(4)
  Array.prototype.concat([
    join("test", "fixtures", "alt"),
    join("test", "fixtures", "alt", "flyfile.js")
  ]).map((flypath) => ({
    spawn: co.wrap(cli.spawn)(flypath),
    flypath: flypath
  }))
  .forEach(_ => {
    _.spawn.then((fly) => {
      t.ok(fly instanceof Fly && fly.host && Array.isArray(fly.plugins),
        "spawn a fly instance using " + _.flypath)
      t.ok(fly.plugins.length === 1 && fly.fakePlugin,
        "load plugins from package.json")
    }).catch((e) => t.ok(false, e))
  })
})
