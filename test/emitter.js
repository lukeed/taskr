var util = require('util');
var test = require('tape').test;
var Emitter = require('../lib/emitter');

function Subscriber() {
	Emitter.call(this);
}
util.inherits(Subscriber, Emitter);

test('✈  Emitter', function (t) {
	t.ok(Emitter !== undefined, 'is defined');

	var e = new Subscriber();
	t.deepEqual(e.events, [], 'inherit events collection');

	e.on('my_event', function (data) {
		t.deepEqual(data, {data: 1}, 'notify events');
		t.end();
	});

	e.emit('my_event', {data: 1});
});
