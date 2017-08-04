var tape = require('tape')
var merry = require('merry')
var memdb = require('memdb')
var got = require('got')
var rest = require('.')

tape('rest', function (t) {
  t.test('defaults', function (assert) {
    assert.plan(2)
    var app = merry()
    var api = rest(app)
    assert.equal(api.api, app)
    assert.equal(api.prefix, '/api/v1')
  })
  t.test('create model', function (assert) {
    assert.plan(1)
    var app = merry()
    var api = rest(app)
    var db = memdb()
    var model = api.model(db, 'model.json')
    assert.ok(model)
  })
  t.test('crud resource', function (assert) {
    assert.plan(3)
    var app = merry()
    var api = rest(app)
    var db = memdb()
    var model = api.model(db, 'model.json')
    api.resource(model, 'model')
    var server = api.start(function () {
      var address = server.address()
      var body = {
        name: 'John Doe',
        mail: 'jdoe@mail.com'
      }
      got('http://' + address.address + ':' + address.port + '/api/v1/model', {
        method: 'POST',
        body: JSON.stringify(body)
      })
      .then(function (response) {
        assert.equal(response.statusCode, 200)
        var data = JSON.parse(response.body).data
        assert.equal(data.name, 'John Doe')
        assert.equal(data.mail, 'jdoe@mail.com')
        server.close()
      })
      .catch(function (error) {
        assert.fail(error)
        server.close()
      })
    })
  })
  t.test('crud resource with options', function (assert) {
    assert.plan(1)
    assert.pass()
  })
  t.test('custom routes', function (assert) {
    assert.plan(1)
    assert.pass()
  })
})
