
var cartodb = require('../');
var secret = require('./secret.js');


// please, fill secret.js using secret.js.example before launch the demo
var client = new CartoDB({user:secret.USER, api_key:secret.API_KEY});

client.on('connect', function() {
    console.log("connected");
});

client.connect();

client.on('data', function(data) {
    console.log(results.rows);
});

client.on('error', function(err) {
    console.log("some error ocurred");
});

// request two queries, put here your tables
client.sql("select * from {table} limit 5", {table: 'tracker'});
client.sql("select * from tracker limit 5 offset 5");


// the process do not finish here, client connection is persistent
// so you have to finish the process manually
// if you dont call client.connect the connection will not be persistent
// so the process will finish after the two request finish

