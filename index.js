var LevelRest = require('level-rest-parser')
var RestParser = require('rest-parser')
var http = require('http')
var path = require('path')
var assert = require('assert')

module.exports = Nanoapp

function Nanoapp (api, opt) {
  if (!(this instanceof Nanoapp)) return new Nanoapp(api, opt)
  opt = opt || {}

  assert.ok(api, 'Nanoapp: api must be defined')
  assert.equal(typeof opt, 'object', 'Nanoapp: opt must be an object')

  this.api = api
  this.prefix = '/api/v' + (opt.version || '1')
}

Nanoapp.prototype.model = function (db, schema) {
  assert.ok(db, 'Nanoapp: db must be defined')
  assert.equal(typeof schema, 'string', 'Nanoapp: schema must be a string')

  var model = new RestParser(LevelRest(db, {
    schema: require(schema)
  }))
  return model
}

Nanoapp.prototype.resource = function (model, opt) {
  opt = opt || {}
  assert.equal(typeof opt, 'object', 'Nanoapp: opt must be an object')
  assert.notOk(opt.only && opt.except, 'Nanoapp: can not define `only` and `except` options at the same time' )

  var noIdMethods = ['GET', 'POST']
  var idMethods = ['GET', 'PUT', 'DELETE']
  if (opt.only) {
    noIdMethods = noIdMethods.filter(function (method) {
      return opt.only.indexOf(method) > 0
    })
    idMethods = idMethods.filter(function (method) {
      return opt.only.indexOf(method) > 0
    })
  }
  if (opt.except) {
    noIdMethods = noIdMethods.filter(function (method) {
      return opt.except.indexOf(method) <= 0
    })
    idMethods = idMethods.filter(function (method) {
      return opt.except.indexOf(method) <= 0
    })
  }
  noIdMethods.length > 0 && this.api.route(noIdMethods, path.join(this.prefix, opt.route), dispatch(model, opt))
  idMethods.length > 0 && this.app.route(idMethods, path.join(this.prefix, opt.route, '/:id'), dispatch(model, opt))
}

Nanoapp.prototype.route = function (method, route, handler) {
  assert.equal(typeof method, 'string')
  assert.equal(typeof route, 'string')
  assert.equal(typeof handler, 'function')

  this.api.route(method, route, handler)
}

Nanoapp.prototype.start = function (cb) {
  cb = cb || function () {}
  assert.equal(typeof cb, 'function', 'Nanoapp: cb must be a function')

  var handler = this.api.start()
  var server = http.createServer(handler)
  server.listen(8080, cb)
}

function dispatch (model, opt) {
  return function (req, res, ctx) {
    if (opt.before) {
      assert.equal(typeof opt.before, 'function', 'Nanoapp: before hook must be a function')
      opt.before(req, res, ctx, next)
    } else {
      next()
    }
    var next = function () {
      if (opt.after) assert.equal(typeof opt.after, 'function', 'Nanoapp: after hook must be a function')

      model.dispatch(req, Object.assign({ valueEncoding: 'json' }, ctx.params), function (err, data) {
        if (err) {
          if (err.notFound) {
            ctx.send(404, { message: 'resource not found' })
          } else {
            ctx.send(500, { message: 'internal server error' })
          }
        } else {
          if (!data) {
            if (req.method !== 'DELETE') {
              ctx.send(404, { message: 'resource not found' })
            } else {
              if (opt.after) {
                opt.after(req, res, ctx)
              } else {
                ctx.send(200, { id: ctx.params.id }, { 'content-type': 'json' })
              }
            }
          } else {
            if (opt.after) {
              ctx.data = data
              opt.after(req, res, ctx)
            } else {
              ctx.send(200, JSON.stringify(data), { 'content-type': 'json' })
            }
          }
        }
      })
    }
  }
}
