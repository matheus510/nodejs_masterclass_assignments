//
// DATA LIB - Database related actions
//

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
  // Open file
  fs.open(lib.baseDir+collection+'/'+fileName+'.json', 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      var dataString = JSON.stringify(fileData);

      // Write in file 
      fs.writeFile(fileDescriptor, dataString, function(err){
        if(!err){
          fs.close(fileDescriptor, function(err){
            if(!err){
              callback(false);
            }else{
              callback('Error : Could not close file correctly');
            }
          });
        }else{
          callback('Error : Could not write file correctly');
        }
      });
    }else{
      callback('Error: Could not open file and obtain file descriptor');
    }
  });
};

// Read data from a file 
lib.read = function(collection, fileName, callback){
  // Check if fileName was informed
  if (fileName){
    fs.readFile(lib.baseDir+collection+'/'+fileName+'.json', 'utf8', function(err, data){
      if(!err && data){
        var parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      }else{
        callback(err, data);
      }
    });
  }else{
    // Create a container for all registers
    var productRegisters = [];
    // Retrieve all registers
    fs.readdirSync(lib.baseDir+collection+'/', function(err, files){
      if(!err && files){
        for (var i = 0, len = files.length; i < len; i++){
          fs.readFile(lib.baseDir+collection+'/'+files[i]+'.json', 'utf8', function(err, data){
            if(!err && data){
              var parsedData = helpers.parseJsonToObject(data);
              // Add file content to array
              productRegisters.push(parsedData);
            }else{
              callback(err, data);
            }
          });
        }
        // After end of for loop, return collected data
        callback(false, productRegisters);
      }else{
        calllback(err, files);
      }
    });
  }
};
// Update data
lib.update = function(collection, fileName, newData, callback){
  // Open file (write, r+ operator)
  fs.open(lib.baseDir+collection+'/'+fileName+'.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      var dataString = JSON.stringify(newData);

      // Truncate (for copying and creating a new version of the file)
      fs.ftruncate(fileDescriptor, function(err){
        if(!err){
          // Writing file
          fs.writeFile(fileDescriptor, dataString, function(err){
            if(!err){
              // Close file, if no errors occured
              fs.close(fileDescriptor, function(err){
                if(!err){
                  callback(false);
                }else{
                  callback('Error : Could not close file correctly');
                }
              });
            }else{
              callback('Error : Could not write file correctly');
            }
          });
        }else{
          callback('Error : Could not truncate file correctly');
        }
      });
    }else{
      callback('Error : Could not open file correctly');
    }
  });
};
// Delete file
lib.delete = function(collection, fileName, callback){
  fs.unlink(lib.baseDir+collection+'/'+fileName+'.json', function(err){
    callback(err);
  });
};
module.exports = lib;
