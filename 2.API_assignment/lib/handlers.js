/*
 * Primary file for the pizza-delivery handlers
 * 
*/

// Container for all handlers
var handlers = {};

// sample handler for testing purposes
handlers.sample = function (data, callback) {
  callback(200, {'name':'sample'});
};
