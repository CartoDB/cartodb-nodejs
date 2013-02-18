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

The library provides two auth ways, oauth client and api key client. Both  have the same funcionallity and you should choose one of them depending on you requirements. 

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

    // template can be used
    client.query("select * from {table} limit 5", {table: 'tracker'}, function(err, data){
    // JSON parsed data or error messages are returned
    })

    // chained calls are allowed
    .query("select * from tracker limit 5 offset 5", function(err, data){});
});

// client is a Stream object instance so you can pipe responses as new line delimited JSON, for example, to a file

var output = require('fs').createWriteStream(__dirname + '/responses.log');
client.pipe(output);

client.connect();

```

CartoDB-nodejs implements visionmedia's debug library. You can see what's happening with the requests via an environment variable
```
DEBUG=cartodb node yourscript.js
```

Dependencies
------------
* nodejs >=0.6.0
* CartoDB account

