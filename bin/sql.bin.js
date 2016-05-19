#!/usr/bin/env node

var CartoDB = require('../');
var fs = require('fs');

var args = [
  { name: 'sql', alias: 's', type: String, defaultOption: true, description: 'A SQL query (required).' },
  { name: 'sqlFile', type: String, description: 'A file containing a SQL query.' },
  { name: 'format', alias: 'f', type: String, description: 'Output format json|csv|geojson|shp|svg|kml|SpatiaLite' },
  { name: 'output', alias: 'o', type: String, description: 'Output file. If omitted will use stdout.' },
];

var options = require('../lib/util/cli.js').getCommandLineArgs(args);

if (options.error) {
  console.log(options.error);
  console.log(options.usage);
  return;
}

if (options.help || (!options.sql && !options.sqlFile)) {
  console.log(options.usage);
  return;
}

if (options.sqlFile) {
  var sql = fs.readFileSync(options.sqlFile).toString();
  options.sql = sql;
}

var sql = new CartoDB.SQL({
  user: options.user,
  api_key: options.api_key
});

if (options.output) {
  var file = require('fs').createWriteStream(options.output);
  sql.pipe(file);
}

sql.execute(options.sql, {
  format: options.format
}).done(function (data) {
  if (!options.output) console.log(data)
}).error(function (error) {
  console.log(error)
});
