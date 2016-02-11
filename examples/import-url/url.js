//uses the cartoDB import API to import a file

var CartoDB = require('../..');
var cdb_config = require('../config.js');

var importer = new CartoDB.Import(cdb_config);

importer
  .url('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.csv', {})
  .done(function(table_name) {
    console.log('Table ' + table_name + ' has been created!');
  })

// importer
//   .url('http://chriswhong.com', {})
//   .error(function(error) {
//     console.log(error);
//   })