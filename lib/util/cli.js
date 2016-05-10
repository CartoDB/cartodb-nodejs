var commonArgs = [
  { name: 'user', alias: 'u', type: String, description: 'Your CartoDB username' },
  { name: 'api_key', alias: 'a', type: String, description: 'Your CartoDB API Key (only needed for write operations)' },
  { name: 'config', alias: 'c', type: String, description: 'Config file. Use a JSON file as a way to input these arguments. If no username nor config file is provided, it will look for "config.json" by default' },
  { name: 'help', alias: 'h' }
];
var commandLineArgs = require('command-line-args');

var readConfigFile = function(path, options) {
  var config = require('fs').readFileSync(path, {encoding: 'utf-8'});
  var configJSON = JSON.parse(config);
  options = require('util')._extend(options, configJSON);
}

module.exports = {
  getCommandLineArgs: function (customArgs) {
    var args = customArgs.concat(commonArgs);
    var cli = commandLineArgs(args);
    var options = cli.parse();

    if (options.config) {
      try {
        readConfigFile(options.config, options);
      } catch (e) {
        options.error = e.message;
      }
    } else if (!options.user) {
      try {
        readConfigFile('config.json', options);
      } catch (e) {
        options.error = 'No user name nor config file was provided. Defaulting to "config.json" also failed.';
      }
    }

    options.usage = cli.getUsage(args);

    return options;
  }
}
