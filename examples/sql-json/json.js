var CartoDB = require('../..');
var cdb_config = require('../config.js');

var sql = new CartoDB.SQL(cdb_config);

// 1 - query only

// 2 - query,vars
// 2 - query,options
// 2 - query,callback

// 3 - query,vars,options
// 3 - query,vars,callback
// 3 - query,options,callback

// 4 - query, vars, options, callback

// //query only
// sql.execute("SELECT * from all_month LIMIT 5")
//   .done(function(data) {
//     console.log(data);
//   });

// //query, vars
// sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'})
//   .done(function(data) {
//     console.log(data);
//   });

// //query, options
// sql.execute("SELECT * from all_month LIMIT 5", {format:'GeoJSON'})
//   .done(function(data) {
//     console.log(data);
//   });

// //query, callback
// sql.execute("SELECT * from all_month LIMIT 5", function(data) {
//   console.log(data);
// })

// //query, vars, options
// sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'},{format:'GeoJSON'})
//   .done(function(data) {
//     console.log(data);
//   });


// //query, vars, callback
// sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'},function(data) {
//   console.log(data);
// })

// //query, options, callback
// sql.execute("SELECT * from all_month LIMIT 5", {format:'GeoJSON'},function(data) {
//   console.log(data);
// })

// query, vars, options, callback
sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'}, {format:'GeoJSON'},function(data) {
  console.log(data);
})




// //INSERT
// sql.execute("INSERT INTO all_month (depth) VALUES (27)")
//   .done(function(data) {
//     console.log(data);
//   })
//   .error(function(error){
//     console.log(error);
//   });

// //should throw an error
// sql.execute("THIS IS NOT VALID SQL")
//   .error(function(error) {
//     console.log(error);
//   });
