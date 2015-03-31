var debug = require('debug')('app')
var http = require('http')
var server = require('./server')

var app = http.createServer(server)

app.listen(process.env.PORT || 1337, process.env.HOST || '0.0.0.0', function listening () {
  var info = app.address()
  debug('Running at ' + info.address + ':' + info.port)
})
