const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, '.tmp');

test('@taskr/typescript', t => {
  t.plan(16);

  const taskr = new Taskr({
    plugins: [
      require('../'),
      require('@taskr/clear')
    ],
    tasks: {
      *a(f) {
        yield f.source(`${dir}/*.ts`).typescript().target(tmp);
        const arr = yield f.$.expand(`${tmp}/*.js`);
        t.equal(arr.length, 1, 'converts to `.js` extension');
        const str = yield f.$.read(`${tmp}/app.js`, 'utf8');
        t.ok(/var App/.test(str), 'compiles to ES3 JavaScript');
        yield f.clear(tmp);
      },
      *b(f) {
        yield f.source(`${dir}/*.ts`).typescript({ removeComments: true }).target(tmp);
        const str = yield f.$.read(`${tmp}/app.js`, 'utf8');
        t.false(/This is a comment/.test(str), 'remove comments if given option');
        yield f.clear(tmp);
      },
      *c(f) {
        yield f.source(`${dir}/*.ts`).typescript({ inlineSourceMap: true }).target(tmp);
        const arr = yield f.$.expand(`${tmp}/*`);
        t.equal(arr.length, 1, 'creates only 1 file');
        const str = yield f.$.read(`${tmp}/app.js`, 'utf8');
        t.ok(/sourceMappingURL/.test(str), 'via `inlineSourceMap`; append `sourceMappingURL` comment');
        t.ok(/data:application\/json/.test(str), 'via `inlineSourceMap`; embed inline sourcemap');
      },
      *d(f) {
        yield f.source(`${dir}/*.ts`).typescript({ sourceMap: true }).target(tmp);
        const arr = yield f.$.expand(`${tmp}/*`);
        t.equal(arr.length, 2, 'creates 2 files');
        const str = yield f.$.read(`${tmp}/app.js`, 'utf8');
        t.ok(/sourceMappingURL/.test(str), 'via `sourceMap`; append `sourceMappingURL` comment');
        t.ok(/app.js.map/.test(str), 'via `sourceMap`; embed link to external sourcemap');
        yield f.clear(tmp);
      },
      *e(f) {
        yield f.source(`${dir}/*.ts`).typescript({
          moduleName: 'FooBar',
          module: 'System',
          target: 'ES2015'
        }).target(tmp);
        const str = yield f.$.read(`${tmp}/app.js`, 'utf8');
        t.ok(/FooBar/.test(str), 'listen to `moduleName` option');
        t.ok(/System.register/.test(str), 'listen to `compilerOptions.module` option');
        t.ok(/App = class App/.test(str), 'listen to `compilerOptions.target` option');
        yield f.clear(tmp);
      },
      *f(f) {
        yield f.source(`${dir}/*.ts`).typescript({
          moduleName: 'FooBar',
          compilerOptions: {
            module: 'System',
            target: 'ES2015'
          }
        }).target(tmp);
        const str = yield f.$.read(`${tmp}/app.js`, 'utf8');
        t.ok(/FooBar/.test(str), 'listen to `moduleName` option');
        t.ok(/System.register/.test(str), 'listen to `compilerOptions.module` option');
        t.ok(/App = class App/.test(str), 'listen to `compilerOptions.target` option');
        yield f.clear(tmp);
      }
    }
  });

  t.ok('typescript' in taskr.plugins, 'add the `typescript` plugin');

  taskr.serial(['a', 'b', 'c', 'd', 'e', 'f']);
});
