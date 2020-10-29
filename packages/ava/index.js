'use strict'

const path = require('path')
const pkgConf = require('pkg-conf')

const Api = require('ava/api')
const Verbose = require('ava/lib/reporters/verbose')
const Logger = require('ava/lib/logger')
const babelConfigHelper = require('ava/lib/babel-config')

module.exports = {
  name: 'ava',
  every: false,
  files: true,
  *func(files, opts) {
    const conf = yield pkgConf('ava')
    const filepath = pkgConf.filepath(conf)
    const projectDir = filepath === null ? process.cwd() : path.dirname(filepath)

    const defaults = {
      babelConfig: babelConfigHelper.validate(conf.babel),
      projectDir,
    }
    opts = Object.assign({}, defaults, opts)

    const api = new Api(opts)
    const reporter = new Verbose()
    reporter.api = api

    const logger = new Logger(reporter)
    logger.start()

    api.on('test-run', runStatus => {
      reporter.api = runStatus
      runStatus.on('test', logger.test)
      runStatus.on('error', logger.unhandledError)
      runStatus.on('stdout', logger.stdout)
      runStatus.on('stderr', logger.stderr)
    })

    const runStatus = yield api.run(files.map(path.format))

    console.log(reporter.finish(runStatus))
    if (runStatus.failCount > 0) throw runStatus.errors
  },
}
