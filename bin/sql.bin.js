#!/usr/bin/env node

var CartoDB = require('../');

var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
  { name: 'sql', alias: 's', type: String, defaultOption: true },
  { name: 'user', alias: 'u', type: String },
  { name: 'api_key', alias: 'a', type: String },
  { name: 'format', alias: 'f', type: String },
  { name: 'output', alias: 'o', type: String },
  { name: 'help', alias: 'h' }
])

var cli_opts = cli.parse();

if (cli_opts.help || !cli_opts.sql) {
  console.log(cli.getUsage());
  return;
}

console.log(cli_opts.api_key)

var sql = new CartoDB.SQL({
  user: cli_opts.user,
  api_key: cli_opts.api_key
});


var options = {};
if (cli_opts.format) options.format = cli_opts.format;

sql.execute(cli_opts.sql, options).done(function (data) {
  if (cli_opts.output) {
    var file = require('fs').createWriteStream(cli_opts.output);
    sql.pipe(file);
  } else {
    console.log(data)
  }
}).error(function (error) {
  console.log('ERROR')
  console.log(error)
})
