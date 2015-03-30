var ClientError = require('errors/client')
var debug = require('debug')('http')
var jsonBody = require('body/json')
var http = require('http')

var app = http.createServer(function server (req, res) {
  function handleError (err) {
    res.writeHead(err.statusCode || 500, {'Content-Type': 'text/plain'})
    debug(err.message || err)
    res.end(err.message || err.toString())
  }

  function handlePost (err, body) {
    if (err) return handleError(err)

    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('got POST ' + JSON.stringify(body))
  }

  function processWebhook (name) {
    var accepted = [
      'ticket.created',
      'ticket.updated',
      'ticket.voided',
      'ticket.unsnoozed',
      'ticket.reassigned'
    ]
    if (accepted.indexOf(name) !== -1) jsonBody(req, res, handlePost)
    else handleError(ClientError({ title: 'Unknown webhook name: ' + name, statusCode: 400 }))
  }

  if (req.url === '/' + process.env.TITO_ACCESS_KEY) {
    if (req.method === 'POST') {
      if (req.headers['x-webhook-name']) return processWebhook(req.headers['x-webhook-name'])

      handleError(ClientError({ title: 'Missing header', statusCode: 400 }))
    } else {
      handleError(ClientError({ title: 'Method not supported: ' + req.method, statusCode: 405 }))
    }
  } else if (req.url === '/ping') {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end('ok')
  } else {
    handleError(ClientError({ title: 'Unknown route: ' + req.url, statusCode: 404 }))
  }
})

app.listen(process.env.PORT || 1337, process.env.HOST || '0.0.0.0', function listening () {
  var info = app.address()
  debug('Running at ' + info.address + ':' + info.port)
})
