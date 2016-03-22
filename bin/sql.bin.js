#!/usr/bin/env node

var CartoDB = require('../');

var commandLineArgs = require('command-line-args');

var args = [
  { name: 'sql', alias: 's', type: String, defaultOption: true, description: 'A SQL query' },
  { name: 'user', alias: 'u', type: String, description: 'Your CartoDB username' },
  { name: 'api_key', alias: 'a', type: String, description: 'Your CartoDB API Key (only needed for write operations)' },
  { name: 'format', alias: 'f', type: String, description: 'Output format json|csv|geojson|shp|svg|kml|SpatiaLite' },
  { name: 'output', alias: 'o', type: String, description: 'Output file. If omitted will use stdout' },
  { name: 'config', alias: 'c', type: String, description: 'Config file.' },
  { name: 'help', alias: 'h' }
];

var cli = commandLineArgs(args);

var cli_opts = cli.parse();

if (cli_opts.help || !cli_opts.sql) {
  console.log(cli.getUsage(args));
  return;
}

var sql = new CartoDB.SQL({
  user: cli_opts.user,
  api_key: cli_opts.api_key
});


var options = {};

if (cli_opts.format) options.format = cli_opts.format;

if (cli_opts.output) {
  var file = require('fs').createWriteStream(cli_opts.output);
  sql.pipe(file);
}

sql.execute(cli_opts.sql, options).done(function (data) {
  if (!cli_opts.output) console.log(data)
}).error(function (error) {
  console.log(error)
})
