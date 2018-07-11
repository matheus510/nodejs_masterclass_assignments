/*
 * Primary file for handlers
 * 
*/

// Handlers imports
var usersHandlers = require('./users.handlers');
var tokenHandlers = require('./token.handlers');
//var productHandlers = require('./product.handlers');

// Container for all handlers
var handlers = {};

// Ping handler for testing purposes
handlers.ping = function (data, callback) {
  callback(200, {'Server':'up'});
};

handlers.notFound = function(data,callback){
  callback(404);
};

handlers.users = usersHandlers
handlers.token = tokenHandlers
//handlers.product = productHandlers


module.exports = handlers
