CartoDB client for node.js
=================================

This library abtsracts calls to CartoDB's SQL and Import APIs.  

Install
-------

```bash
npm install cartodb
```


Usage
-----

Here's a simple example to make a SQL API call.

```
var CartoDB = require('cartodb');

var sql = new CartoDB.SQL({user:{USERNAME}, api_key:{APIKEY}})

sql.execute("SELECT * FROM mytable LIMIT 10")
  //you can listen for 'done' and 'error' promise events
  .done(function(data) {
    console.log(data) //data.rows is an array with an object for each row in your result set
  });

```

SQL Module
----------

###Methods

Execute SQL
`SQL.execute(sql [,vars][, options][, callback])`

`vars` - An object of variables to be rendered with `sql` using Mustache
`options` - An object for options for the API call.  Only {format: "GeoJSON"} works right now
`callback` - A function that the `data` object will be passed to if the API call is successful.

`.done()` and `.error()` can be chained after `SQL.execute()`.  

```
var sql = new CartoDB.SQL({user:{USERNAME}, api_key:{APIKEY}});
sql.execute("SELECT * from {{table}} LIMIT 5")
  .done(function(data) {
    //do stuff with the data object
  })
  .error(function(error) {
    //error contains the error message
  })


```

###Piping

You can pipe data from the SQL.execute()

```
var file = require('fs').createWriteStream(__dirname + '/output.json');

var sql = new CartoDB.SQL({user:{USERNAME}, api_key:{APIKEY}});

sql.execute("SELECT * from {{table}} LIMIT 5", {table: 'all_month'})


sql.pipe(file);
```


Import Module
-------------

(In progress)
###Methods

Import a file - This method is the same as dragging a file (CSV,ZIP,XLS,KML) into the CartoDB GUI. The end result is a table in your account.

This method takes the path to your file and results in a table_name for the newly-created table.

`Import.file(filePath, options)`

`.done()` and `.error()` can be chained after `SQL.execute()`.  

```
var importer = new CartoDB.Import({user:{USERNAME}, api_key:{APIKEY}});
var path = require('path');

importer
  .file(path.join(__dirname, 'all_week.csv'), {
    privacy: 'public'
  })
  .done(function(table_name) {
    console.log('Table ' + table_name + ' has been created!');
  });

```
