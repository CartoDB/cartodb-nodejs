var CartoDB = require('../..');
var cdb_config = require('../config.js');

var file = require('fs').createWriteStream(__dirname + '/output.json');

var sql = new CartoDB.SQL(cdb_config);

sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'})
  

sql.pipe(file);

