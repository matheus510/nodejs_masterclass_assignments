//
// USER handlers file
//

// Dependencies
var helpers = require('../helpers');
var _data = require('../data');
var tokenHandlers = require('../handlers/token.handlers');

// Create object to export to handlers

var lib = {};

// Create wrapper for all user methods
lib = function(data,callback){
  // List accepted http methods
  var acceptableMethods = ['post','get','put','delete'];

  if(acceptableMethods.indexOf(data.method) > -1){
    lib._user[data.method](data,callback);
  }else{
    callback(405);
  }
};

// Container for all user methods
lib._user = {};

// User - post
// Required fields: firstName, lastName, emailAddress, streetAddress, password, tosAgreement
lib._user.post = function(data, callback){
  //Parse payload
  var parsedPayload = JSON.parse(data.payload);

  var firstName = typeof(parsedPayload.firstName) == 'string' && parsedPayload.firstName.trim().length > 0 ? parsedPayload.firstName.trim() : false;
  var lastName = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
  var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress.trim()) ? parsedPayload.emailAddress.trim() : false;
  var streetAddress = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
  var password = typeof(parsedPayload.password) == 'string' && parsedPayload.password.trim().length > 5 ? parsedPayload.password.trim() : false;
  var tosAgreement = typeof(parsedPayload.tosAgreement) == 'boolean' && parsedPayload.tosAgreement ? true : false;

  if(firstName && lastName && emailAddress && streetAddress && password && tosAgreement){
    // Check if user already exist
    _data.read('users',emailAddress,function(err,data){
      if(err){
        var hashedPassword = helpers.hash(password);
        if(hashedPassword){
          // Prepare object to be saved
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
            }else{
              callback(500, {'Error': 'Could not creat a new user'});
            }
          });
        }else{
          callback(500, {'Error' : 'Could not hash password properly'});
        }
      }else{
        callback(400, {'Error' : 'User already exist'});
      }
    });
  }else{
    callback(400, {'Error' : 'Missing required fields (or invalid fields)'});
  }
};

// User - get
// Required field: emailAddress
lib._user.get = function(data, callback){
  // Verify token
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  var emailAddress = typeof(data.queryStringObject.email) == 'string' && helpers.validateEmail(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

  tokenHandlers._token.verifyToken(token, emailAddress, function(tokenIsValid){
    if(tokenIsValid){
      // Validate email
      var emailAddress = typeof(data.queryStringObject.email) == 'string' && helpers.validateEmail(data.queryStringObject.email) ? data.queryStringObject.email : false;
      if(emailAddress){
        // Check if user exists and return the data for that user
        _data.read('users', emailAddress, function(err, data){
          if(!err && data){
            delete data.password;
            callback(200, data);
          }else{
            callback(404);
          }
        });
      }else{
        callback(400, {'Error' : 'Invalid email address'});
      }
    }else{
      callback(400, {'Error' : 'Invalid token'});
    }
  });
};

// User - put
// Required fields: emailAddress and one optional field
// Optional fields: firstName, lastName, streetAddress, password
lib._user.put = function(data, callback){
  // Verify token
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  tokenHandlers._token.verifyToken(token,emailAddress,function(tokenIsValid){
    if(tokenIsValid){
      // Parse payload
      var parsedPayload = JSON.parse(data.payload);
      // Verify if the email informed does exist
      var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress) ? parsedPayload.emailAddress : false;
      // Check optional fields sended
      var firstName = typeof(parsedPayload.firstName) == 'string' && parsedPayload.firstName.trim().length > 0 ? parsedPayload.firstName.trim() : false;
      var lastName = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
      var streetAddress = typeof(parsedPayload.lastName) == 'string' && parsedPayload.lastName.trim().length > 0 ? parsedPayload.lastName.trim() : false;
      var password = typeof(parsedPayload.password) == 'string' && parsedPayload.password.trim().length > 5 ? parsedPayload.password.trim() : false;
      // Check if user exists and return the data for that user
      if(emailAddress){
        if (firstName || lastName || streetAddress || password){
          _data.read('users', emailAddress, function(err, userData){
            if(!err && userData){
              // Update fields sent
              if (firstName){
                userData.firstName = firstName;
              }
              if (lastName){
                userData.lastName = lastName;
              }
              if (streetAddress){
                userData.streetAddress = streetAddress;
              }
              if (password){
                userData.password = helpers.hash(password);
              }
              _data.update('users',emailAddress,userData,function(err){
                if(!err){
                  delete userData.password;
                  callback(200, userData);
                }else{
                  callback(500,{'Error' : 'Could not update the user'});
                }
              });
            }else{
              callback(400, {'Error' : 'User specified does not exist'});
            }
          });
        }else{
          callback(400, {'Error' : 'Missing fields to be updated'});
        }
      }else{
        callback(400, {'Error' : 'Missing required field'});
      }
    }else{
      callback(400, {'Error' : 'Invalid token'});
    }
  });
};
// User - delete
// Required fields: emailAddress
lib._user.delete = function(data, callback){
  // verify token
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  tokenHandlers._token.verifyToken(token,phone,function(tokenIsValid){
    if(tokenIsValid){
      // Parse payload
      var parsedPayload = JSON.parse(data.payload);
      // Verify if the email informed does exist
      var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress) ? parsedPayload.emailAddress : false;

      if(emailAddress){
          _data.delete('users', emailAddress, function(err){
            if(!err){
              callback(200);
            }else{
              callback(500, {'Error' : 'User could not be deleted'});
            }
          });
        }else{
          callback(400, {'Error' : 'User not found'});
        }
      }else{
      callback(400, {'Error' : 'Invalid token'});
    }
  });
}

module.exports = lib;
