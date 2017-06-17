const format = require('prettier').format;

module.exports = function (task) {
	task.plugin('prettier', {}, function * (file, opts) {
		const out = format(file.data.toString(), opts);
		file.data = Buffer.from(out);
	});
};
