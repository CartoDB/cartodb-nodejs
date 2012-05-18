CartoDB client for node.js
=================================

This library allows to perform async read/write queries to cartodb.

Install
------

```bash
npm install cartodb
```


Usage
-----

The library provides two clents, oauth client and api key client. Two clients basically have the same funcionallity and you should choose one of them depending on you requirements. 

```javascript
var cartodb = require('cartodb');
var secret = require('./secret.js');


/* you could change this by CartoDBClient if you want to use oath
client = new cartodb.CartoDBClient(
        secret.USER,
        secret.password,
        secret.CONSUMER_KEY, 
        secret.CONSUMER_SECRET);
*/
var client = new cartodb.CartoDBClientApiKey(secret.USER, secret.API_KEY);


client.on('connect', function() {
    console.log("connected");
});

// this is not required for ApiKey client
// if you dont call client.connect the connection will not be persistent
// so the process will finish after the two request finish
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

// the process will not finish here if client connection is persistent
```



Dependencies
------------
* nodejs >0.4.10
* npm
* CartoDB account

be careful with nodejs version you are using, there are some problems with https module in 0.4.8 version https://github.com/joyent/node/issues/728
