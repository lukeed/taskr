#!/usr/bin/env node
'use strict'

var node = process.argv[0]
var fly = require('path').join(__dirname, 'lib')
var args = ['--harmony'].concat(fly).concat(process.argv.slice(2))

/**
 * Spawn a new Node process
 */
require('child_process').spawn(node, args, {stdio: 'inherit'}).on('close', function (code) {
	process.exitCode = code
})
