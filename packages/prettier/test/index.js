const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const plugins = [require('@taskr/clear'), require('../')];

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/prettier', t => {
	t.plan(2);
	const taskr = create({
		*foo(f) {
			t.true('prettier' in f, 'attach `prettier` to Task instance');
			t.true('prettier' in taskr.plugins, 'attach `prettier` plugin to instance');
		}
	});
	taskr.start('foo');
});

test('@taskr/prettier (defaults)', t => {
	t.plan(3);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-1');
			yield f.source(`${dir}/*.js`).prettier().target(tmp);

			const str = yield f.$.read(`${tmp}/foo.js`, 'utf8');
			t.false(/\s\s/.test(str), 'truncated extra spaces');
			t.false(/'/.test(str), 'converted single quotes');
			t.true(/;/.test(str), 'added semicolons');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/prettier (options)', t => {
	t.plan(3);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			yield f.source(`${dir}/*.js`).prettier({
				singleQuote: true,
				semi: false
			}).target(tmp);

			const str = yield f.$.read(`${tmp}/foo.js`, 'utf8');
			t.false(/\s\s/.test(str), 'truncated extra spaces');
			t.false(/;/.test(str), 'turned off semicolons');
			t.true(/'/.test(str), 'kept single quotes');
			yield f.clear(tmp);
		}
	}).start('foo');
});
