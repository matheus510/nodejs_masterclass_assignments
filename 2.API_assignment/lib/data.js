/*
 * Primary file for the pizza-delivery data lib
 * 
*/
// Dependencies

var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// Create container for all data methods
var lib = {};

// Create basedir property on lib object

lib.baseDir = path.join(__dirname,'/../.data/');

// Persist data to a new file
lib.create = function(collection, fileName, fileData, callback){
  // open file
  fs.open(lib.baseDir+collection+'/'+fileName+'.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      var dataString = JSON.stringify(fileData);

      //Write in file 
      fs.writeFile(fileDescriptor, dataString, function(err){
        if(!err){
          fs.close(fileDescriptor, function(err){
            if(!err){
              callback(false)
            } else {
              callback('Error : Could not close file correctly')
            }
          })
        } else {
          callback('Error : Could not write file correctly')
        }
      });
    }
  });
}

// Read data from a file 
lib.read = function(collection, fileName, callback){
  fs.readFile(lib.baseDir+collection+'/'+fileName+'.json', 'utf8', function(err,data){
    if(!err && data){
      var parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
}
// Update data
lib.update = function(collection, fileName, newData, callback){
  // open file (write, r+ operator)
  fs.open(lib.baseDir+collection+'/'+fileName+'.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      var dataString = JSON.stringify(newData);

      // truncate (for copying and creating a new version of the file)
      fs.truncate(fileDescriptor, function(err){
        if(!err){
          
          // writing file
          fs.writeFile(fileDescriptor, dataString, function(err){
            if(!err){

              // close file, if no errors occured
              fs.close(fileDescriptor, function(err){
                if(!err) {
                  callback(false)
                } else {
                  callback('Error : Could not close file correctly')
                }
              })
            } else {
              callback('Error : Could not write file correctly')
            }
          })
        } else {
          callback('Error : Could not truncate file correctly')
        }
      })
    } else {
      callback('Error : Could not open file correctly')
    }
  })
}
// delete file
lib.delete = function(collection, fileName, callback) {
  fs.unlink(lib.baseDir+collection+'/'+fileName+'.json', function(err){
    callback(err);
  });
}
module.exports = lib