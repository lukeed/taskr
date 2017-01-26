"use strict"

const co = require("bluebird").coroutine
const join = require("path").join
const test = require("tape")

const Fly = require("../lib/fly")
const cli = require("../lib/cli")
const $ = require("../lib/fn")

const fixtures = join(__dirname, "fixtures")
const flypath = join(fixtures, "flyfile.js")

function log(func) {
	const _log = console.log
	console.log = s => s // hijack
	const out = func() // save output
	console.log = _log // un-hijack
	return out // send output
}

test("cli", t => {
	t.ok(cli !== undefined, "is defined")
	const cmds = ["help", "list", "spawn", "version", "options"]
	cmds.forEach(cmd => {
		t.true(cmd in cli, `cli.${cmd} is defined`)
	})
	t.end()
})

test("cli.version", t => {
	const pkg = require("../package")
	const out = log(() => cli.version(pkg))
	t.ok(out.length, "shows fly version")
	t.equal(out, `${pkg.name}, ${pkg.version}`, "shows correct version")
	t.end()
})

test("cli.help", t => {
	const out = log(cli.help)
	t.ok(out.length, "shows fly help")
	t.true(/Usage/gm.test(out), "includes `Usage` section")
	t.true(/Options/gm.test(out), "includes `Options` section")
	t.true(/Examples/gm.test(out), "includes `Examples` section")
	t.end()
})

test("cli.list", t => {
	const file = require(flypath)

	const rgx1 = /Available tasks/i
	const rgx2 = /task(A|B|C)/gm
	const rgx3 = /task-(a|b|c)/gm

	const out1 = log(() => cli.list(file))
	const out2 = log(() => cli.list(file, true))

	t.true(rgx1.test(out1), "includes spacing when `bare` is `false`")
	t.false(rgx1.test(out2), "minimizes output when `bare` is `true`")

	const arr1 = out1.match(rgx2)
	const arr2 = out2.match(rgx2)
	const arr3 = out1.match(rgx3)
	const arr4 = out2.match(rgx3)

	t.true(arr1 && arr2 && arr1.length === arr2.length, "lists all tasks, always")
	t.true(arr3 && arr4 && arr3.length === arr4.length, `lists all tasks" descriptions, always`)

	t.end()
})

test("cli.spawn", co(function * (t) {
	const alt = join(fixtures, "alt")
	const flyfile = join(alt, "flyfile.js")
	const types = [{p: alt, t: "directory"}, {p: flyfile, t: "file"}]

	for (const src of types) {
		const f = yield cli.spawn(src.p)
		t.true(f instanceof Fly, `via ${src.t} spawns Fly`)
		t.equal(f.file, flyfile, `via ${src.t} finds flyfile`)
		t.true($.isObject(f.tasks) && "a" in f.tasks, `via ${src.t} loads Fly tasks (obj)`)
		t.equal(Object.keys(f.plugins).length, 3, `via ${src.t} found all VALID plugins`)
		t.true($.isObject(f.plugins), `via ${src.t} loads Fly plugins (obj)`)
	}

	const fly1 = yield cli.spawn()
	t.true(fly1 instanceof Fly, "via `null` still spawns Fly")
	t.equal(fly1.file, undefined, "via `null` but without a flyfile")

	const fly2 = yield cli.spawn("/fake12312")
	t.equal(fly2.file, undefined, "fake directory no `fly.file` attached")

	t.end()
}))

test("cli.options", t => {
	const o = cli.options() // defaults
	t.true(o.cwd === ".", "defaults `cwd` to `.`")
	t.true(o.d === o.cwd, "assigns `d` alias to `cwd`")
	t.true(o.mode === "serial", "defaults `mode` to `serial`")
	t.true(o.m === o.mode, "assigns `m` alias to `mode`")

	const val = {
		d: "/test",
		m: "parallel",
		l: "bare",
		_: "test1 test2"
	}

	const max = cli.options(`-d=${val.d} -m=${val.m} --list=${val.l} ${val._}`.split(" "))

	t.true(max.d === max.cwd && max.d === val.d, "assigns `cwd` value")
	t.true(max.m === max.mode && max.m === val.m, "assigns `mode` value")
	t.true(max.l === max.list && max.l === val.l, "assigns `list` value")
	t.true(max._.join(" ") === val._, "assigns `tasks` value")

	try {
		cli.options(['--foo=bar'])
	} catch (err) {
		t.true(/Invalid option/.test(err.toString()), "throws error if unknown argument")
	}

	t.end()
})
