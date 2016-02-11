//uses the cartoDB import API to import a file

var CartoDB = require('cartodb');
var config = require('../config.js');

var importer = new CartoDB.Import({user:config.username, api_key:config.api_key});


// client.on('done',function(string) {
//   console.log(string);
// })

importer
.file(__dirname + '/' + 'all_week.csv', {})
.done(function(table_name) {
  console.log('Table ' + table_name + ' has been created!');
})