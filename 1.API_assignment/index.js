/*
 *  entry file for the API
 */ 

var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var server = http.createServer(function (req, res) {

  var parsedUrl = url.parse(req.url, true);

  var path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

  var method = req.method.toLowerCase();

  var headers = req.headers;

  var decoder = new StringDecoder('utf-8');

  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
    buffer += decoder.end();

    var chosenHandler = typeof(router[path]) !== 'undefined' ? router[path] : handlers.notFound;

    var data = {
      'path' : path,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };
    chosenHandler(data,function(statusCode,payload){

      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
    
  })
});

server.listen(3000,function(){
  console.log('The server is up and running now');
});

var handlers = {};

handlers.hello = function(data,callback){
  callback(200, { welcome: 'message'});
};
handlers.notFound = function(data,callback){
  callback(404);
};
var router = {
  'hello' : handlers.hello
};
