/*
 * Config file. Separated by env.
 *
 */

// Create a container for all configuration for envs
var config = {};

config.staging = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'staging' 
};

config.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production'
};
// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(config[currentEnvironment]) == 'object' ? config[currentEnvironment] : config.staging;

module.exports = environmentToExport
