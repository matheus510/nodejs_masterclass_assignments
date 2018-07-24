//
// PRODUCT handlers files
//

// Dependencies
var helpers = require('../helpers');
var _data = require('../data');

// Create object to be exported
var lib = {};

lib.product = function(data, callback){
  // List accepted http methods
  var acceptableMethods = ['post','get','put','delete'];
  
  if(acceptableMethods.indexOf(data.method) > -1){
    lib._product[data.method](data,callback);
  }else{
    callback(405);
  }
};

// Container for all token methods
lib._product = {};

// Product - post
// Required fields: name, , price, 
lib._product.post = function(data, callback){
  // Verify token
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  handlers._token.verifyToken(token, emailAddress, function(tokenIsValid){
    if(tokenIsValid){  
      // Parse payload
      var parsedPayload = JSON.parse(data.payload);

      var name = typeof(parsedPayload.name) == 'string' && parsed.parsedPayload.name.trim() > 0 ? parsedPayload.name.trim() : false;
      var price = typeof(parsedPayload.price) == 'number' && parsed.parsedPayload.price > 0 ? parsedPayload.price : false;
      
      if(name && price){
        // Check if this product is already registered with the same id
        _data.read('products', id, function(err, data){
          if(err){
            // Create ID for this input
            var idNewProduct = helpers.createRandomString(20);
            // Create object to persist in data files
            var newProduct = {
              'name': name,
              'price': price,
              'id': idNewProduct
            };
            // Persist new product
            _data.create('products', newProduct.id, newProduct, function(err){
              if(!err){
                callback(200, 'Product created successfuly');
              }else{
                callback(500, 'Could not create new product');
              }
            });
          }else{
            callback(400, {'Error': 'Product already exist'});
          }
        });
      }else{
        callback(400, {'Error' : 'Invalid product name'});
      }
    }else{
      callback(400, {'Error': 'Invalid token'});
    }
  });
};
// Product - get
// Required: none
// Optional query string parameters: id
lib._product.get = function(data, callback){
  // Check if id was informed
  var id = typeof(parsedPayload.id) == 'number' && idLength == 20 ? parsedPayload.id : false;
    if(id){
      _data.read('products', id, function(err, data){
        if(!err && data){
          callback(200, data);
        }else{
          callback(404, {'Error' : 'No product were found with the given id'});
        }
      });
    }else{
    _data.read('products', false, function(err, data){
      if(!err && data){
        callback(200, data);
      }else{
        callback(404, {'Error' : 'No products were found in this collection'});
      }
    });
  }
};
// Product - put
// Required fields: id and a optional field
// Optional fields: name, price
lib._product.put = function(data, callback){
  // Verify token
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  handlers._token.verifyToken(token,emailAddress,function(tokenIsValid){
    if(tokenIsValid){
      // Parse payload
      var parsedPayload = JSON.parse(data.payload);
      // Verify id and id length
      var idLength = Math.log(parsedPayload.id) * Math.LOG10E + 1 | 0;
      var id = typeof(parsedPayload.id) == 'number' && idLength == 20 ? parsedPayload.id : false;
      // Verify if name or price were sended
      var name = typeof(parsedPayload.name) == 'string' && parsedPayload.name.trim() > 0 ? parsedPayload.name.trim() : false;
      var price = typeof(parsedPayload.price) == 'number' && parsedPayload.price > 0 ? parsedPayload.price : false;
      if(id){
        if(name || price){
          _data.read('products', id, function(err, productData){
            if(!err && data){
              // Update fields as provided
              if(name){
                productData.name = name;
              }
              if(price){
                productData.price = price;
              }
              _data.updated('products', id, productData, function(err){
                if(!err){
                  callback(200, productData);
                }else{
                  callback(500, {'Error': 'Could not update the product, something wrong occurred'});
                }
              });
            }else{
              callback(404, {'Error': 'Could not find specified product to update it'});
            }
          });
        }
      }else{
        callback(400, {'Error': 'Invalid Id'});
      }
    }else{
      callback(400, {'Error': 'Invalid token'});
    }
  });
};
// Product - delete
// Required fields: id
lib._product.delete = function(data, callback){
  // Verify token
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  handlers._token.verifyToken(token,phone,function(tokenIsValid){
    if(tokenIsValid){
      // Parse payload
      var parsedPayload = JSON.parse(data.payload);
      // Verify if the id informed does exist
      var id = typeof(parsedPayload.id) == 'number' && idLength == 20 ? parsedPayload.id : false;

      if(id){
        _data.delete('products', id, function(err){
          if(!err){
            callback(200);
          }else{
            callback(500, {'Error' : 'Product could not be deleted'});
          }
        });
      }else{
        callback(400, {'Error' : 'Product not found'});
      }
    }else{
      callback(400, {'Error' : 'Invalid token'});
    }
  });
};

module.exports = lib;
