#!/usr/bin/env node

var CartoDB = require('../');
var path = require('path');

var args = [
  { name: 'file', alias: 'f', type: String, defaultOption: true, description: 'Path to a local file to import.' },
  { name: 'url', alias: 'l', type: String, description: 'URL to import.' },
  { name: 'privacy', alias: 'p', type: String, description: 'Privacy of the generated table (public|private)' },
];

var options = require('../lib/util/cli.js').getCommandLineArgs(args);

if (options.help || (!options.file && !options.url)) {
  console.log(options.usage);
  return;
}

var importer = new CartoDB.Import({
  user: options.user,
  api_key: options.api_key
});

var opts = {
  privacy: options.privacy || 'public'
}

var importing;
if (options.file) {
  importing = importer.file(options.file, opts);
} else if (options.url) {
  importing = importer.url(options.url, opts);
}

importing.done(function(table_name) {
  console.log('Table ' + table_name + ' has been created!');
});
