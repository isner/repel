
var http = require('http');
var connect = require('connect');
var jade = require('jade');
var path = require('path');
var fs = require('fs');

var config = require('./config.json');

var filename = path.join(__dirname, 'views/layout.jade');

  // Define jade rendering options
var options = {
  'filename': filename,
  'pretty': true
};

  // Configure the server, using 'connect'
var app = connect()
  .use(connect.logger('dev'))
  .use(function (req, res) {

      // Render jade to html
    var html = jade.renderFile(req.filepath, options);
    res.end(html);

  });

  // Create the server, using node's 'http'
http.createServer(app).listen(config.port);

console.log('|-------------------------------------------------------------');
console.log('| << ' + config.name + ' >>                                   ');
console.log('| Running at:   http://127.0.0.1:' + config.port + '/         ');
console.log('| Running from: ' + __dirname + '                             ');
console.log('|-------------------------------------------------------------');
