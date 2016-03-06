CartoDB client for node.js
=================================

This library abstracts calls to CartoDB's SQL and Import APIs.  

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

var sql = new CartoDB.SQL({user:{USERNAME}})

sql.execute("SELECT * FROM mytable LIMIT 10")
  //you can listen for 'done' and 'error' promise events
  .done(function(data) {
    console.log(data) //data.rows is an array with an object for each row in your result set
  });

```

SQL Module
----------

###Methods

#### constructor

```
var sql = new CartoDB.SQL({
  user: {USERNAME},
  api_key: {APIKEY}
});
```
Note: `api_key` is only required for a write query.

#### SQL.execute

`SQL.execute(sql [,vars][, options][, callback])`

`vars` - An object of variables to be rendered with `sql` using Mustache

`options` - An object for options for the API call. Default is `json`.
```
{
  format: 'json'|'csv'|'geojson'|'shp'|'svg'|'kml'|'SpatiaLite'
}
```
More details about formats : [CartoDB SQL API docs](http://docs.cartodb.com/cartodb-platform/sql-api/making-calls/#response-formats)

`callback` - A function that the `data` object will be passed to if the API call is successful.

This will return a promise. `.done()` and `.error()` can be chained after `SQL.execute()`.

`.done()` first argument will be either :
 an object containing  (when using json format) or a raw string (when using all other formats).   

```
var sql = new CartoDB.SQL({user:{USERNAME});
sql.execute("SELECT * from {{table}} LIMIT 5")
  .done(function(data) {
    console.log(`Executed in ${data.time}, total rows: ${data.total_rows}`);
    console.log(data.rows[0].cartodb_id)
  })
  .error(function(error) {
    //error contains the error message
  });
```

```
var sql = new CartoDB.SQL({user:{USERNAME}});
sql.execute("SELECT * from {{table}} LIMIT 5", { format: 'csv' })
  .done(function(data) {
    console.log('raw CSV data :');
    console.log(data);
  });
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

`file` - Import a file from the filesystem - This method is the same as dragging a file (CSV,ZIP,XLS,KML) into the CartoDB GUI. The end result is a table in your account.

This method takes the path to your file and results in a table_name for the newly-created table.

`Import.file(filePath, options)`


`.done()` and `.error()` can be chained after `Import.file()`.  

`url` - Import a file from URL - This method is the same as specifying a publicly accessible url to import in the CartoDB GUI.  The end result is a table in your account.

This method takes the URL to your file and results in a table_name for the newly-created table.

`Import.url(url, options)`

`.done()` and `.error()` can be chained after `Import.url()`.  

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
