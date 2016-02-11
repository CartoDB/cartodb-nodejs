var CartoDB = require('cartodb');
var config = require('../config.js');

var file = require('fs').createWriteStream(__dirname + '/output.json');

var client = new CartoDB({user:config.username, api_key:config.api_key});

client
.query("select * from {table} limit 5", {table: 'all_month'})
  

client.pipe(file);

