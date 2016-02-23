var test = require('tape').test;
var reporter = require('../lib/reporter');

var fakeEmitter = function (event, t) {
	return ({
		on: function (e) {
			if (e === event) {
				t.ok(true, 'notify ' + event + ' events');
			}
			return this;
		}
	});
};

test('✈  reporter', (t) => {
	var ctx = fakeEmitter();
	t.deepEqual(reporter.call(ctx), ctx, 'return the bound object');
	[
		'fly_run',
		'flyfile_not_found',
		'fly_watch',
		'plugin_load',
		'plugin_error',
		'task_error',
		'task_start',
		'task_complete',
		'task_not_found'
	].forEach(function (event) {
		return reporter.call(fakeEmitter(event, t));
	});
	t.end();
});

// test('✈  timeInfo', function (t) {
//   var timeInfo = require('../src/reporter/timeInfo').default
//   t.deepEqual(timeInfo(100), { duration: 100, scale: 'ms' },
//     'use `ms` units by default.')
//   t.deepEqual(timeInfo(1000), { duration: 1, scale: 's' },
//     'convert long units to seconds.')
//   t.end()
// })
