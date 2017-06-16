'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');

const expect = '.file__c{visibility:hidden}.file__b{display:block}.file__a{display:none}.main{display:block}\n';

test('@taskr/sass', t => {
  t.plan(7);

  const taskr = new Taskr({
    plugins: [
      require('../'),
      require('@taskr/clear')
    ],
    tasks: {
      a: function * (f) {
        const map = `${tmp}/out.css.map`;
        const src = `${dir}/style.sass`;
        const tar = `${tmp}/style.css`;

        yield f.source(src).sass().target(tmp);
        t.ok(yield f.$.find(tar), 'create a `.css` file correctly');

        yield f.source(src).sass({ outputStyle:'compressed' }).target(tmp);
        t.equal(yield f.$.read(tar, 'utf8'), expect, 'resolve multi-level imports && types!');

        yield f.source(src).sass({ sourceMap:map }).target(tmp);
        const arr1 = yield f.$.expand(`${tmp}/*`);
        t.equal(arr1.length, 2, 'via `sourceMap`; create a source map');
        t.ok(yield f.$.find(map), 'via `sourceMap`; create a source map with custom name');
        yield f.clear(tmp);

        yield f.source(src).sass({ sourceMap:true, outFile:map }).target(tmp);
        const arr2 = yield f.$.expand(`${tmp}/*`);
        t.equal(arr2.length, 2, 'via `sourceMap + outFile`; create a source map');
        t.ok(yield f.$.find(map), 'via `sourceMap + outFile`; create a source map with custom name');
        yield f.clear(tmp);
      }
    }
  });

  t.ok('sass' in taskr.plugins, 'attach `sass` plugin to taskr');

  taskr.start('a');
});
