//
// TOKEN handlers file
//

// Dependencies
var helpers = require('../helpers');
var _data = require('../data');

// Create object to be exported
var lib = {};

lib = function(data, callback){
  // List accepted http methods
  var acceptableMethods = ['post','get','put','delete'];

  if(acceptableMethods.indexOf(data.method) > -1){
    lib._token[data.method](data,callback);
  }else{
    callback(405);
  }
};

// Tokens wrapper for all methods
lib._token = {};

// Tokens - post
// Required fields: emailAddress and password
lib._token.post = function(data, callback){
  
  var parsedPayload = JSON.parse(data.payload);
  var emailAddress = typeof(parsedPayload.emailAddress) == 'string' && helpers.validateEmail(parsedPayload.emailAddress) ? parsedPayload.emailAddress : false;
  var password = typeof(parsedPayload.password) == 'string' && parsedPayload.password.trim().length > 5 ? parsedPayload.password.trim() : false;
  
  if(emailAddress && password){
    // Look up the email address to see if it already does exist
    _data.read('users', emailAddress, function(err, userData){
      if(!err && userData){
        var hashedPassword = helpers.hash(password);
        if(hashedPassword === userData.password){
          // If valid, create a new token with a random id. Set an expiration date 1 hour in the future.
          var tokenId = helpers.createRandomString(20);
          var tokenObject = {
            'emailAddress' : emailAddress,
            'id' : tokenId,
            'expires': Date.now() + 1000 * 60 * 60
          };
          // Store the token
          _data.create('tokens', tokenId, tokenObject, function(err){
            if(!err){
              callback(200, tokenObject);
            }else{
              callback(500, {'Error' : 'Could not create the new token'});
            }
          });
        }else{
          callback(400, {'Error' : 'Invalid password'});
        }
      }else{
        callback(500, {'Error': 'Could not look up the email address'});
      }
    });
  }else{
    callback(400, {'Error' : 'Invalid email address or password'});
  }
};

// Tokens - get
// Required data: id
lib._token.get = function(data,callback){
  // Check that id is valid
  var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

  if(id){
    // Lookup the token
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        callback(200,tokenData);
      }else{
        callback(404);
      }
    });
  }else{
    callback(400,{'Error' : 'Missing required field, or field invalid'});
  }
};

// Tokens - put
// Required data: id, extend
lib._token.put = function(data,callback){
  
  var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  
  if(id && extend){
    // Search the token to see if it exists
    _data.read('tokens',id,function(err,tokenData){
      if(!err && tokenData){
        // Check to make sure the token isn't already expired
        if(tokenData.expires > Date.now()){
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update('tokens',id,tokenData,function(err){
            // Return the result
            if(!err){
              callback(200);
            }else{
              callback(500,{'Error' : 'Could not update the token\'s expiration.'});
            }
          });
        }else{
          callback(400,{"Error" : "The token has already expired, and cannot be extended."});
        }
      }else{
        callback(400,{'Error' : 'Specified user does not exist.'});
      }
    });
  }else{
    callback(400,{"Error": "Missing required field(s) or field(s) are invalid."});
  }
};


// Tokens - delete
// Required data: id
lib._token.delete = function(data,callback){
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
          }else{
            callback(500,{'Error' : 'Could not delete the specified token'});
          }
        });
      }else{
        callback(400,{'Error' : 'Could not find the specified token.'});
      }
    });
  }else{
    callback(400,{'Error' : 'Missing required field'});
  }
};

// Verify if a given token id is currently valid for a given user
lib._token.verifyToken = function(id,emailAddress,callback){
  // Lookup the token
  _data.read('tokens',id,function(err,tokenData){
    if(!err && tokenData){
      // Check that the token is for the given user and has not expired
      if(tokenData.emailAddress == emailAddress && tokenData.expires > Date.now()){
        // Set new expire time for this users token, one more hour
        tokenData.expires = Date.now() + 1000 * 60 * 60; 
        _data.update('tokens', id, tokenData,function(err){
          if(!err){
            callback(true);
          }else{
            // Treat error no updating expiration date
            callback(true);
          }
        });
      }else{
        callback(false);
      }
    }else{
      callback(false);
    }
  });
};

module.exports = lib;
