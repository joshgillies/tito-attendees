var serverTest = require('servertest')
var server = require('../app/server')
var test = require('tape')
var http = require('http')
var fs = require('fs')

var app = http.createServer(server)

test('unkown routes 404', function (t) {
  serverTest(app, '/i-dont-even', { encoding: 'utf8' }, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 404, 'correct statusCode')
    t.end()
  })
})

test('can ping the web server', function (t) {
  serverTest(app, '/ping', { encoding: 'utf8' }, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 200, 'correct statusCode')
    t.equal(res.body, 'ok', 'correct body content')
    t.end()
  })
})

test('unsupported HTTP methods', function (t) {
  serverTest(app, '/', { encoding: 'utf8', method: 'GET' }, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 405, 'correct statusCode')
    t.equal(res.body, 'Method not supported: GET client error, status=405', 'correct body content')
    t.end()
  })
})

test('missing header \'x-webhook-name\'', function (t) {
  var opts = {
    encoding: 'utf8',
    method: 'POST'
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 400, 'correct statusCode')
    t.equal(res.body, 'Missing header client error, status=400', 'correct body content')
    t.end()
  })

  serverStream.end('test')
})

test('unknown \'x-webhook-name\' value', function (t) {
  var opts = {
    encoding: 'utf8',
    method: 'POST',
    headers: {
      'x-webhook-name': 'fail'
    }
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 400, 'correct statusCode')
    t.equal(res.body, 'Unknown webhook name: fail client error, status=400', 'correct body content')
    t.end()
  })

  serverStream.end('test')
})

test('process webhook', function (t) {
  var rs = fs.createReadStream(__dirname + '/fixtures/example.json')
  var opts = {
    encoding: 'utf8',
    method: 'POST',
    headers: {
      'x-webhook-name': 'ticket.created'
    }
  }
  var serverStream = serverTest(app, '/', opts, function (err, res) {
    t.ifError(err, 'no error')
    t.equal(res.statusCode, 200, 'correct statusCode')
    t.end()
  })

  rs.pipe(serverStream)
})
