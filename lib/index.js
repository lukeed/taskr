'use strict'

var co = require('co')
var cli = require('./cli')
var utils = require('./utils')
var reporter = require('./reporter')
var notifier = require('update-notifier')
var pkg = require('../package')
var errorTypes = require('./utils/errors').errorTypes

co(function * () {
	// check if using latest
	notifier({pkg: pkg}).notify()

	// get command options
	var opts = cli.options()
	var tasks = opts._

	if (opts.help) {
		cli.help()
	} else if (opts.version) {
		cli.version(pkg)
	} else {
		var fly = reporter.call(yield cli.spawn(opts.file))

		if (!fly.file) {
			return fly.emit('flyfile_not_found')
		}

		if (opts.list) {
			return cli.list(fly.host, {bare: opts.list === 'bare'})
		}

		fly.emit('fly_run', {path: fly.file}).start(tasks)
	}
}).catch(function (e) {
	if (e.type === errorTypes.UnknownOption) {
		utils.error('Unknown option ' + e.key + '. Run fly -h to see available options')
	} else if (e.type === errorTypes.InvalidKey) {
		utils.error('Invalid options!')
		utils.log('Note, options should start with -, and can not contain any special symbols, like {}*#?')
	} else {
		utils.trace(e)
	}
})

// export Fly
module.exports = require('./fly')
