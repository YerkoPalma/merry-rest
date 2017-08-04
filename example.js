var rest = require('.')
var merry = require('merry')
var memdb = require('memdb')

var app = merry()
var api = rest(app, { default: function (req, res, ctx) { ctx.send(404, { message: 'not found' }) } })

// db is a levelup instance
var model = api.model(memdb(), 'model.json')

api.resource(model, 'model')
api.start()
