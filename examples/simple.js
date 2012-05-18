
var cartodb = require('../');
var secret = require('./secret.js');


var client = new cartodb.CartoDBClientApiKey(secret.USER, secret.API_KEY);

client.on('connect', function() {
    console.log("connected");
});

// this is not required for ApiKey client, see below
client.connect();

client.on('data', function(data) {
    var results = JSON.parse(data);
    console.log(results.rows);
});

client.on('error', function(err) {
    console.log("some error ocurred");
});

// request two queries
client.sql("select * from tracker limit 5");
client.sql("select * from tracker limit 5 offset 5");


// the process do not finish here, client connection is persistent
// so you have to finish the process manually
// if you dont call client.connect the connection will not be persistent
// so the process will finish after the two request finish

