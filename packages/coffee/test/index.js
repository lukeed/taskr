const join = require("path").join;
const Taskr = require("taskr");
const test = require("tape");

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');

test('@taskr/coffee', (t) => {
  t.plan(6);

  const taskr = new Taskr({
    plugins: [
      require('../'),
      require('@taskr/clear')
    ],
    tasks: {
      *foo(f) {
        t.ok('coffee' in taskr.plugins, 'attach the `coffee()` plugin to taskr');

        yield f.source(`${dir}/foo.coffee`).coffee().target(tmp);

        const want = yield f.$.read(`${dir}/foo.js`, 'utf8');
        const sent = yield f.$.read(`${tmp}/foo.js`, 'utf8');

        t.ok(sent, 'creates a `.js` file');
        t.equal(sent, want, 'compile the `.coffee` contents correctly');

        yield f.clear(tmp);
      },
      *bar(f) {
        yield f.source(`${dir}/bar.coffee`).coffee({ sourceMap:true }).target(tmp);

        const map = yield f.$.read(`${tmp}/bar.js.map`);
        t.ok(map, 'compiler receives options/config');

        const arr = yield f.$.expand(`${tmp}/*`);
        t.equal(arr.length, 2, 'creates a file and external sourcemap');

        const str = yield f.$.read(`${tmp}/bar.js`, 'utf8');
        t.ok(/sourceMappingURL/.test(str), 'via `sourceMap`; attach `sourceMappingURL` comment');

        yield f.clear(tmp);
      }
    }
  });

  taskr.serial(['foo', 'bar']);
});
