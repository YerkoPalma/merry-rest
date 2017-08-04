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
  t.test('default route', function (assert) {
    assert.plan(2)
    var app = merry()
    var api = rest(app, { default: function (req, res, ctx) { ctx.send(404, { message: 'not found' }) } })
    var server = api.start(function () {
      var address = server.address()
      got('http://' + address.address + ':' + address.port + '/api/v1/model')
        .then(function (response) {
          assert.fail(response)
        })
        .catch(function (error) {
          assert.equal(error.response.statusCode, 404)
          var data = JSON.parse(error.response.body)
          assert.equal(data.message, 'not found')
          server.close()
        })
    })
  })
  t.test('crud resource', function (assert) {
    assert.plan(8)
    var app = merry()
    var api = rest(app)
    var db = memdb()
    var model = api.model(db, 'model.json')
    var url = null
    var modelObject = null
    api.resource(model, 'model')
    var server = api.start(function () {
      var address = server.address()
      url = 'http://' + address.address + ':' + address.port + '/api/v1/model'
      var body = {
        name: 'John Doe',
        mail: 'jdoe@mail.com'
      }
      // POST
      got(url, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      .then(function (response) {
        assert.equal(response.statusCode, 200)
        modelObject = JSON.parse(response.body).data
        assert.equal(modelObject.name, 'John Doe')
        assert.equal(modelObject.mail, 'jdoe@mail.com')
        // GET
        got(url)
          .then(function (response) {
            assert.deepEqual([modelObject], JSON.parse(response.body).data)
            // GET :id
            got(url + '/' + modelObject.id)
              .then(function (response) {
                assert.deepEqual(modelObject, JSON.parse(response.body))
                var newBody = {
                  name: 'James Doe',
                  mail: 'james.doe@mail.com'
                }
                // PUT :id
                got(url + '/' + modelObject.id, {
                  method: 'PUT',
                  body: JSON.stringify(newBody)
                })
                  .then(function (response) {
                    assert.equal(response.statusCode, 200)
                    modelObject = JSON.parse(response.body).data
                    assert.equal(modelObject.name, 'James Doe')
                    assert.equal(modelObject.mail, 'james.doe@mail.com')
                    server.close()
                  })
                  .catch(function (error) {
                    assert.fail(error)
                    server.close()
                  })
              })
              .catch(function (error) {
                assert.fail(error)
                server.close()
              })
          })
          .catch(function (error) {
            assert.fail(error)
            server.close()
          })
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
