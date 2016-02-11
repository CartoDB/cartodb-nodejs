//uses the cartoDB import API to import a file

var CartoDB = require('../..');
var cdb_config = require('../config.js');

var importer = new CartoDB.Import(cdb_config);

importer
  .file(__dirname + '/' + 'all_week.csv', {})
  .done(function(table_name) {
    console.log('Table ' + table_name + ' has been created!');
  })

importer
  .file(__dirname + '/' + 'invalid.mdb', {})
  .error(function(error) {
    console.log(error);
  })