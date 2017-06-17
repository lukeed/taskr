const Taskr = require('taskr');
const test = require('tape');

test('@taskr/jest', t => {
	t.plan(2);
	const taskr = new Taskr({
		plugins: [require('../')],
		tasks: {
			*foo(f) {
				t.true('jest' in f, 'attach `jest` to Task instance');
				t.true('jest' in taskr.plugins, 'attach `jest` plugin to instance');
			}
		}
	});
	taskr.start('foo');
});
