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
var CartoDB = require('cartodb');
var secret = require('./secret.js');


/* you could change this providing an api_key instead of consumer key / secret if you want to use oath
client = new CartoDB({
       user: secret.USER,
       password: secret.password,
       consumer_key: secret.CONSUMER_KEY, 
       consumer_secret: secret.CONSUMER_SECRET
});
*/
var client = new CartoDB({user: secret.USER,api_key: secret.API_KEY});


client.on('connect', function() {
    console.log("connected");
});

// Data if automatically parsed
client.on('data', function(data) {
    console.log(results.rows);
});

client.on('error', function(err) {
    console.log("some error ocurred");
});

// request two queries
client.sql("select * from {table} limit 5", {table: 'tracker'}); // template can be used
client.sql("select * from tracker limit 5 offset 5");

// the process will not finish here if client connection is persistent
```



Dependencies
------------
* nodejs >0.5.0
* npm
* CartoDB account

