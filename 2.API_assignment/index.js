//
// INDEX - Initial file for PizzaDeliveryAPI
// Author: Matheus de Sousa Monteiro Fonseca (https://github.com/matheus510)
//

// Dependencies
var http = require('http');
var https = require('https');
var config = require('./lib/config');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var handlers = require('./lib/handlers');

var httpsServer = https.createServer(function(req, res){
  internalServer(req, res);
});
var httpServer = http.createServer(function(req, res){
  internalServer(req, res);
});
var internalServer = function(req, res){

  // Parse received url
  var parsedUrl = url.parse(req.url,true);

  // Obtain path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObj = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  // Check for a matching path for the handler
  req.on('end', function(){
    buffer += decoder.end();

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObj,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    chosenHandler(data, function(statusCode, payload){
      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      console.log('foi')
      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response: ",statusCode,payloadString);
    });
  });
};

httpServer.listen(config.httpPort, function(){
  console.log('\x1b[42m%s\x1b[0m','listening at port: '+ config.httpPort);
});
httpsServer.listen(config.httpsPort, function(){
  console.log('\x1b[42m%s\x1b[0m','listening at port: '+ config.httpsPort);
});

// Define the request router
var router = {
  'ping' : handlers.ping,
  'user' : handlers.user,
  'token' : handlers.token,
  'product' : handlers.product,
  'cart' : handlers.cart
};
