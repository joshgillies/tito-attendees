var webhook = require('tito-webhook')
var debug = require('debug')('app')
var http = require('http')

var _webhook = webhook('/', function(err, data) {
  console.log(err || JSON.stringify(data))
})

var app = http.createServer(function server (req, res) {
  _webhook(req, res, function done () {
    res.statusCode = 404
    res.end()
  })
})

app.listen(process.env.PORT || 1337, process.env.HOST || '0.0.0.0', function listening () {
  var info = app.address()
  debug('Running at ' + info.address + ':' + info.port)
})
