
var CartoDB = require('../');
var secret = require('./secret.js');


// please, fill secret.js using secret.js.example before launch the demo
var client = new CartoDB({user:secret.USER, api_key:secret.API_KEY});

client.on('connect', function() {
    console.log("connected");
});

client.connect();

client.on('data', function(data) {
    console.log(data.rows);
});

client.on('error', function(err) {
    console.log("some error ocurred");
});

// request two queries, put here your tables
client.query("select * from {table} limit 5", {table: 'tracker'});
client.query("select * from tracker limit 5 offset 5");

