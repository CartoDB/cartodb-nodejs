var commonArgs = [
  { name: 'user', alias: 'u', type: String, description: 'Your CartoDB username' },
  { name: 'api_key', alias: 'a', type: String, description: 'Your CartoDB API Key (only needed for write operations)' },
  { name: 'config', alias: 'c', type: String, description: 'Config file. Use a JSON file as a way to input these arguments.' },
  { name: 'help', alias: 'h' }
];
var commandLineArgs = require('command-line-args');


module.exports = {
  getCommandLineArgs: function (customArgs) {
    var args = customArgs.concat(commonArgs);
    var cli = commandLineArgs(args);
    var options = cli.parse();

    if (options.config) {
      var config = require('fs').readFileSync(options.config, {encoding: 'utf-8'});
      var configJSON = JSON.parse(config);
      options = require('util')._extend(options, configJSON);
    }

    options.usage = cli.getUsage(args);

    return options;
  }
}
