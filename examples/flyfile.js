var fs = require('fs')
var join = require('path').join
var exec = require('child_process').exec

exports.default = function * () {
	var self = this
	var pwd = process.cwd()
	var files = fs.readdirSync(self.root)

	for (var file of files) {
		var sample = join(pwd, file)
		var stats = fs.statSync(sample)

		if (!stats.isDirectory()) {
			self.log('Skipping: ' + file)
			continue
		}

		try {
			fs.statSync(join(sample, 'node_modules'))
		} catch (_) {
			process.chdir(sample)

			self.log('Installing → ' + process.cwd())

			exec('npm i', function () {
				process.chdir(self.root)
			})
		}
	}
}
