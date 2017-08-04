var tape = require('tape')
var merry = require('merry')
// var memdb = require('memdb')
var rest = require('.')
var server

tape('setup', function (t) {
  var app = merry()
  var api = rest(app)
  server = api.start()
  t.end()
})

tape('teacher', function (t) {
  t.test('create', function (assert) {
    assert.plan(1)
    assert.pass()
  })

  t.test('read, update and delete not allowed', function (assert) {
    assert.plan(1)
    assert.pass()
  })
})

tape('teardown', function (t) {
  server.close()
  t.end()
})
