/*
 * Primary file for handlers
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
// USERS handlers begin
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
  //Parse payload
  var parsedPayload = JSON.parse(data.payload);

  var firstName = typeof(parsedPayload.firstName) == 'string' && parsedPayload.firstName.trim().length > 0 ? parsedPayload.firstName.trim() : false;
  var lastName = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
  var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress.trim()) ? parsedPayload.emailAddress.trim() : false;
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
          };
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
handlers._users.get = function(data, callback) {
  var emailAddress = typeof(data.queryStringObject.email) == 'string' && helpers.validateEmail(data.queryStringObject.email) ? data.queryStringObject.email : false;
  if(emailAddress){
    // Check if user exists and return the data for that user
    //@TODO add authentication
    _data.read('users', emailAddress, function(err, userData){
      if(!err && userData) {
        delete userData.password;
        callback(200, userData);
      } else {
        callback(404);
      }
    })
  } else {
    callback(400, {'Error' : 'Invalid email address'});
  }
};

// Users - put
// Required fields: emailAddress and one optional field
// Optional fields: firstName, lastName, streetAddress, password
handlers._users.put = function(data, callback) {
    //Parse payload
    var parsedPayload = JSON.parse(data.payload);
    // Verify if the email informed does exist
    var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress) ? parsedPayload.emailAddress : false;
    // Check optional fields sended
    var firstName = typeof(parsedPayload.firstName) == 'string' && parsedPayload.firstName.trim().length > 0 ? parsedPayload.firstName.trim() : false;
    var lastName = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
    var streetAddress = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
    var password = typeof(parsedPayload.password) == 'string' && parsedPayload.password.trim().length > 5 ? parsedPayload.password.trim() : false;
    
    if(emailAddress){
      if (firstName || lastName || streetAddress || password) {
        // Check if user exists and return the data for that user
        // @TODO add authentication
        _data.read('users', emailAddress, function(err, userData){
          if(!err && userData) {
            // Update fields sent
            if (firstName) {
              userData.firstName = firstName;
            }
            if (lastName) {
              userData.lastName = lastName;
            }
            if (streetAddress) {
              userData.streetAddress = streetAddress;
            }
            if (password) {
              userData.password = helpers.hash(password);
            }
            _data.update('users',emailAddress,userData,function(err){
              if(!err){
                callback(200);
              } else {
                callback(500,{'Error' : 'Could not update the user.'});
              }
            });
          } else {
            callback(400, {'Error' : 'User specified does not exist'});
          }
        })
      } else {
        callback(400, {'Error' : 'Missing fields to be updated'})
      }
    } else {
      callback(400, {'Error' : 'Missing required field'});
    }
};
// Users - delete
// Required fields: emailAddress
//@TODO only let user deletion if token is present
handlers._users.delete = function(data, callback) {
  //Parse payload
  var parsedPayload = JSON.parse(data.payload);
  // Verify if the email informed does exist
  var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress) ? parsedPayload.emailAddress : false;

  if(emailAddress) {
    //add authorization!
    _data.delete('users', emailAddress, function(err){
      if(!err) {
        callback(200)
      } else {
        callback(500, {'Error' : 'User could not be deleted'})
      }
    })
  } else {
    callback(400, {'Error' : 'User not found'})
  }
}
// USERS handlers end

// TOKENS handlers begin
handlers.tokens = function(data, callback) {
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
}

// Tokens wrapper for all methods
handlers._tokens = {}

// Tokens - post
// Required fields: emailAddress and password
handlers._tokens.post = function (data, callback) {
  
  var parsedPayload = JSON.parse(data.payload);
  var emailAddress = typeof(data.payload.emailAddress) == 'string' && helpers.validateEmail(data.payload.emailAddress) ? data.payload.emailAddress : false;
  var password = typeof(parsedPayload.password) == 'string' && parsedPayload.password.trim().length > 5 ? parsedPayload.password.trim() : false;

  if(emailAddress && password) {
    //look up the email address to see if it already does exist
    _data.read('users', emailAddress, function (err, userData) {
      if(!err && userData) {
        var hashedPassword = helpers.hash(password);
        if(hashedPassword === userData.password) {
          // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20);
          var tokenObject = {
            'emailAddress' : emailAddress,
            'id' : tokenId
          };
          // Store the token
          _data.create('tokens',tokenId,tokenObject,function(err){
            if(!err){
              callback(200,tokenObject);
            } else {
              callback(500,{'Error' : 'Could not create the new token'});
            }
          });
        } else {
          callback(400, {'Error' : 'Invalid password'})
        }
      } else {
        callback(500, {'Error': 'Could not look up the email address'})
      }
    });
  } else {
    callback(400, {'Error' : 'Invalid email address or password'})
  }
}

// Tokens - get
// Required data: id
handlers._tokens.get = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        callback(200,tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field, or field invalid'})
  }
};

// Tokens - put
// Required data: id, extend
handlers._tokens.put = function(data,callback){
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if(id && extend){
    // search the token to see if it exists
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Check to make sure the token isn't already expired
        if(tokenData.expires > Date.now()){
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update('tokens',id,tokenData,function(err){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not update the token\'s expiration.'});
            }
          });
        } else {
          callback(400,{"Error" : "The token has already expired, and cannot be extended."});
        }
      } else {
        callback(400,{'Error' : 'Specified user does not exist.'});
      }
    });
  } else {
    callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
  }
};


// Tokens - delete
// Required data: id
handlers._tokens.delete = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Delete the token
        _data.delete('tokens',id,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified token'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified token.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function(id,phone,callback){
  // Lookup the token
  _data.read('tokens',id,function(err,tokenData){
    if(!err && tokenData){
      // Check that the token is for the given user and has not expired
      if(tokenData.phone == phone && tokenData.expires > Date.now()){
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
// TOKENS handlers end
module.exports = handlers
