import {join} from 'path'

import test from 'ava'
import Taskr from 'taskr'

test('pass', t => {
  const taskr = new Taskr({
    plugins: [ require('../') ],
    tasks: {
      *foo(f) {
        yield f.source([ join(__dirname, '/fixture/pass.js') ]).ava()
      },
    },
  })

  return taskr.start('foo')
    .then(() => t.pass('ok'))
    .catch(() => t.fail('should be the test that was succeeded'))
})

test('fail', t => {
  const taskr = new Taskr({
    plugins: [ require('../') ],
    tasks: {
      *foo(f) {
        yield f.source([ join(__dirname, '/fixture/fail.js') ]).ava()
      },
    },
  })

  return taskr.start('foo')
    .then(() => t.failed('should be the test that was failed'))
    .catch(() => t.pass('ok'))
})
