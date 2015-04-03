var ClientError = require('errors/client')
var debug = require('debug')('http')
var jsonBody = require('body/json')
var sendPlain = require('send-data/plain')

module.exports = function server (req, res) {
  function handleError (err) {
    debug(err.message || err)
    sendPlain(req, res, {
      body: err.message || err,
      statusCode: err.statusCode || 500
    })
  }

  function handlePost (err, body) {
    if (err) return handleError(err)
    sendPlain(req, res, 'ok')
  }

  function processWebhook (name) {
    var accepted = [
      'ticket.created',
      'ticket.updated',
      'ticket.voided',
      'ticket.unsnoozed',
      'ticket.reassigned'
    ]
    if (~accepted.indexOf(name)) jsonBody(req, res, handlePost)
    else handleError(ClientError({ title: 'Unknown webhook name: ' + name, statusCode: 400 }))
  }

  if (req.url === '/' + (process.env.TITO_ACCESS_KEY || '')) {
    if (req.method === 'POST') {
      if (req.headers['x-webhook-name']) return processWebhook(req.headers['x-webhook-name'])

      handleError(ClientError({ title: 'Missing header', statusCode: 400 }))
    } else {
      handleError(ClientError({ title: 'Method not supported: ' + req.method, statusCode: 405 }))
    }
  } else if (req.url === '/ping') {
    sendPlain(req, res, 'ok')
  } else {
    handleError(ClientError({ title: 'Unknown route: ' + req.url, statusCode: 404 }))
  }
}
