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

Named Maps Module 
-----------

###Constructor - Pass in a config object with `user` and `api_key`
```
var namedMaps = new CartoDB.Maps.Named({
    user: 'username',
    api_key: 'yourreallylongcartodbapikey'
});
```

###Methods - All methods create a promise, and you can listen for `done` and `_error` events.

####`Named.create()` - Create a named map by providing a JSON template

Named Map Template:
```
{
  "version": "0.0.1",
  "name": "world_borders",
  "auth": {
    "method": "token",
    "valid_tokens": [
      "auth_token1",
      "auth_token2"
    ]
  },
  "placeholders": {
    "color": {
      "type": "css_color",
      "default": "red"
    },
    "cartodb_id": {
      "type": "number",
      "default": 1
    }
  },
  "layergroup": {
    "version": "1.0.1",
    "layers": [
      {
        "type": "cartodb",
        "options": {
          "cartocss_version": "2.1.1",
          "cartocss": "/** category visualization */ #world_borders { polygon-opacity: 1; line-color: #FFF; line-width: 0; line-opacity: 1; } #world_borders[cat=0] { polygon-fill: #A6CEE3; } #world_borders[cat=1] { polygon-fill: #1F78B4; } #world_borders[cat=2] { polygon-fill: #2167AB; } #world_borders[cat=3] { polygon-fill: #5077b5; }",
          "sql": "SELECT *, mod(cartodb_id,4) as cat FROM world_borders"
        }
      }
    ]
  },
  "view": {
    "zoom": 4,
    "center": {
      "lng": 0,
      "lat": 0
    },
    "bounds": {
      "west": -45,
      "south": -45,
      "east": 45,
      "north": 45
    }
  }
}
```


```
namedMaps.create({
   template: template
 })
   .on('done', function(res) {
    console.log(res)
  })
```
Response:
```
{ template_id: 'world_borders' }
```


####`Named.instantiate()` - Instantiate a named map to get a layergroupid, passing an options object with the `template_id`, `auth_token` (if required), and placeholder `params` (if needed by your named map template)
```
namedMaps.instantiate({
  template_id: 'world_borders',
  auth_token: 'auth_token1', 
  params: {
    color: '#ff0000',
    cartodb_id: 3
  }
})
  .on('done', function(res) {
    console.log(res)
  })
```
Response:
```
{ layergroupid: 'chriswhong@72f19e2f@28aa9b31a7147f1d370f0f6322e16de6:1453321153152',
  metadata: { layers: [ [Object] ] },
  cdn_url: 
   { http: 'ashbu.cartocdn.com',
     https: 'cartocdn-ashbu.global.ssl.fastly.net' },
  last_updated: '2016-01-20T20:19:13.152Z' }
```

####`Named.update()` - Update a Named Map template

```
namedMaps.update({
  template: template
})
  .on('done', function(res) {
    console.log(res)
  })
```
Response:
```
{ template_id: 'world_borders' }
```

####`Named.delete()` - Delete a named map - pass it an options object with `template_id`

```
namedMaps.delete({
  template_id: 'world_borders'
})
  .on('done', function(template_id) {
    console.log(template_id);
  })
```
Response is the `template_id` that was just deleted:
```
world_borders
```
####`Named.list()` - Get a list of all named maps in your account
```
namedMaps.list()
  .on('done', function(res) {
    console.log(res);
  });
```
####`Named.definition()` - Get the current template for a named map

```
namedMaps.definition({
  template_id: 'world_borders'
})
  .on('done', function(res) {
    console.log(res);
  });
```
