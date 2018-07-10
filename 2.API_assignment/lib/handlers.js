/*
 * Primary file for the pizza-delivery handlers
 * 
*/
// Dependencies
var helpers = require('./helpers')
var _data = require('./data')

// Container for all handlers
var handlers = {};

// Ping handler for testing purposes
handlers.ping = function (data, callback) {
  callback(200, {'Server':'up'});
};

handlers.notFound = function(data,callback){
  callback(404);
};

// Create wrapper for all users methods
handlers.users = function(data,callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all users methods
handlers._users = {}

// Users - post
// Required fields: firstName, lastName, emailAddress, streetAddress, password, tosAgreement
handlers._users.post = function (data, callback) {
  var parsedPayload = JSON.parse(data.payload)
  var firstName = typeof(parsedPayload.firstName) == 'string' && parsedPayload.firstName.trim().length > 0 ? parsedPayload.firstName.trim() : false;
  var lastName = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
  var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress.trim()) ? parsedPayload.emailAddress.trim() : false
  var streetAddress = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
  var password = typeof(parsedPayload.password) == 'string' && parsedPayload.password.trim().length > 5 ? parsedPayload.password.trim() : false;
  var tosAgreement = typeof(parsedPayload.tosAgreement) == 'boolean' && parsedPayload.tosAgreement ? true : false;

  if(firstName && lastName && emailAddress && streetAddress && password && tosAgreement){
    // check if user already exist
    _data.read('users',emailAddress,function(err,data){
      if(err){
        var hashedPassword = helpers.hash(password);
        if(hashedPassword){
          // prepare object to be saved
          var newUser = {
            'firstName': firstName,
            'lastName': lastName,
            'emailAddress': emailAddress,
            'streetAddress': streetAddress,
            'password': hashedPassword,
            'tosAgreement': true
          }
          // Persist new user
          _data.create('users', newUser.emailAddress, newUser, function(err){
            if(!err){
              callback(200, 'User created successfuly');
            } else {
              callback(500, {'Error': 'Could not creat a new user'});
            }
          })
        } else {
          callback(500, {'Error' : 'Could not hash password properly'});
        }
      } else {
        callback(400, {'Error' : 'User already exist'});
      }
    })
  } else {
    callback(400, {'Error' : 'Missing required fields (or invalid fields)'});
  }
};

// Users - get
// Required field: emailAddress
//@TODO add authorizarion token, only the user should be capable of getting its own user
handlers._users.get = function(data, callback) {
  console.log(data)
  var emailAddress = typeof(data.queryStringObject.email) == 'string' && helpers.validateEmail(data.queryStringObject.email) ? data.queryStringObject.email : false
  if(emailAddress){
    // Check if user exists and return the data for that user
    _data.read('users', emailAddress, function(err, data){
      if(!err && data) {
        delete data.password;
        callback(200, data);
      } else {
        callback(404);
      }
    })
  } else {
    callback(400, {'Error' : 'Invalid email address'})
  }
}
// Users - put

// Users - delete

module.exports = handlers
