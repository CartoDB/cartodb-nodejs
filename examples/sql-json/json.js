var CartoDB = require('../..');
var cdb_config = require('../config.js');

var sql = new CartoDB.SQL(cdb_config);
var sql2 = new CartoDB.SQL(cdb_config);

//SELECT statment using Mustache template
sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'})
  .done(function(data) {
    console.log(data.rows[0]);
  });

//INSERT
sql2.execute("INSERT INTO all_month (depth) VALUES (27)")
  .done(function(data) {
    console.log(data);
  });

//should throw an error
sql.execute("THIS IS NOT VALID SQL")
  .error(function(error) {
    console.log(error);
  });
