module.exports = function (f, handler) {
	var ctx = this;
	var log = console.log;

	console.log = function _log() {
		var args = [].slice.call(arguments);
		console.log = log;
		if (handler.apply(ctx, args)) {
			console.log = _log;
		}
	};

	f.call();
	console.log = log;
};
