# merry-rest
[![npm version](https://img.shields.io/npm/v/merry-rest.svg?style=flat-square)](https://www.npmjs.com/package/merry-rest) [![Build Status](https://img.shields.io/travis/YerkoPalma/merry-rest/master.svg?style=flat-square)](https://travis-ci.org/YerkoPalma/merry-rest) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> serve rest apis with merry and json-schema

## Usage

```js
var rest = require('merry-rest')
var merry = require('merry')

var app = merry()
var api = rest(app)

// db is a levelup instance
var model = api.model(db, 'schema.json')

api.resource(model, { route: 'schema' })
api.start()
```

After running the `.start()` method,  you will have the following routes 
availaible

```
GET     /api/v1/schema
GET     /api/v1/schema/:id
POST    /api/v1/schema
PUT     /api/v1/schema/:id
DELETE  /api/v1/schema/:id
```

## API

### api = rest(app [, opts])

Create a rest api instance. `app` is a [merry][merry] instance and is mandatory. `opts` 
is an optional configuration object, availaible options are:

- **version:**  Defaults to 1, specify the version of your api, it will be used 
in the route.
- **default:** Set a default route in case of a missmatch. Must be a `function` 
like `function (reques, response, context)`

The returned object has two properties: `api` the merry instance, and `prefix` 
the prefix of all the routes. The prefix has the form `'/api/v:version'`

### var model = api.model(db, schema)

Create a [rest-parser][rest-parser] instance using 
[level-rest-parser][level-rest-parser] as backend. `db` and `schema` are mandatory.
`db` is a levelup instance where the data is saved and `schema` is a string with 
the path to the json file that contains your schema. The rest-parser instance 
returned here is used later in the `resource` method.

### api.resource(model , opts)

Generate the rest routes for the given `model`. You must provide a model and 
opts argument, where opts can be a string or an object. If opts is a string, 
then that will be the route of your model, it it is an object, it can have the 
following properties:

- **route:** The only required property. Must be a string indicating your model 
route.

- **only:** Must be an `array` of `strings`. If defined, set explicity the 
methods for which this resource define routes. For example, seting 
`{ only: ['GET', 'POST'] }` will set only these routes

```
GET     /api/v1/schema
GET     /api/v1/schema/:id
POST    /api/v1/schema
```

- **except:** Similar to the `only` option, must be an array of strings and 
will do the oposite thing, so having `{ except: ['PUT', 'DELETE'] }` as an option 
will result in these routes:

```
GET     /api/v1/schema
GET     /api/v1/schema/:id
POST    /api/v1/schema
```

As you can see, you can achieve the same result with both options, but what you 
can not do, is define them bot in the same call, 
`{ except: ['DELETE'], only: ['GET'] }`, that option has no sense, and it will throw.

- **before:** Must be a `function`. If defined, will be called _before_ every 
route for this resource. It accepts four arguments `req`, `res`, `ctx` and `next` 
which are the reques, the response, the merry context and a callback, in this 
case, the actual route method. So if you don't call `next(req, res, ctx)` your 
actual route wont be called, this is useful if your before hook must cancell the 
request

- **after:** As you might guess, this is like `before` hook, but after. 
Difference are that you don't provide a next hook, because there is nothing 
next. Also, you must end the request manually here, this is easily done with 
merry context object, like [`ctx.send(200, bodyData, headers)`][send]

### api.route(method, route, handler)

Define a special route not set by any of the rest routes. Method is a `string`, 
route is also a `string` and handler a function like next in the hooks 
(with `req, res, ctx`).

### var server = api.start([cb])

Start a regular http server with the rest routes defined. Optionally, you can 
pass a callback to be run after the server start listening. `cb` must be a 
function.

## License
[MIT](/license)

[rest-parser]: https://github.com/karissa/node-rest-parser
[level-rest-parser]: https://github.com/karissa/level-rest-parser
[merry]: https://github.com/shipharbor/merry
[send]: https://github.com/shipharbor/merry#ctxsendstatuscode-data-headers