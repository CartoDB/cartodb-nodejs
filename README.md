CartoDB client for node.js
=================================

This library abstracts calls to CartoDB's SQL, Import, and Maps APIs.  

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

### Constructor

Pass in a config object with `user` and `api_key`

```
var namedMaps = new CartoDB.Maps.Named({
    user: 'username',
    api_key: 'yourreallylongcartodbapikey'
});
```

### Methods

All methods create a promise, and you can listen for `done` and `_error` events.

#### `Named.create()` - Create a named map by providing a JSON template

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


#### `Named.instantiate()` - Instantiate a named map to get a layergroupid, passing an options object with the `template_id`, `auth_token` (if required), and placeholder `params` (if needed by your named map template)
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

#### `Named.update()` - Update a Named Map template

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

#### `Named.delete()` - Delete a named map - pass it an options object with `template_id`

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
#### `Named.list()` - Get a list of all named maps in your account
```
namedMaps.list()
  .on('done', function(res) {
    console.log(res);
  });
```
#### `Named.definition()` - Get the current template for a named map

```
namedMaps.definition({
  template_id: 'world_borders'
})
  .on('done', function(res) {
    console.log(res);
  });
```

Command-line access
-------------

### SQL Module: `cartodb` / `cartodb-sql`

```
Options

  -s, --sql string       A SQL query (required).
  -u, --user string      Your CartoDB username.
  -a, --api_key string   Your CartoDB API Key (only needed for write operations).
  -f, --format string    Output format json|csv|geojson|shp|svg|kml|SpatiaLite
  -o, --output string    Output file. If omitted will use stdout.
  -c, --config string    Config file. Use a JSON file as a way to input these arguments. If no username nor config file is provided, it will look for "config.json" by default.
  -h, --help
```

#### Examples

```
$ cartodb -u nerik -f svg 'SELECT * FROM europe' > europe.svg
$ cartodb -u nerik -f csv 'SELECT cartodb_id, admin, adm_code FROM europe LIMIT 5' -o europe.csv
$ cartodb -c config.json 'UPDATE ...' #hide your api_key in this file !
$ cartodb 'UPDATE ...' # "config.json" will be used for credentials by default

```

### Import Module: `cartodb-import`


```
Options

  -f, --file string      Path to a local file to import.
  -l, --url string       URL to import.
  -p, --privacy string   Privacy of the generated table (public|private)
  -u, --user string      Your CartoDB username
  -a, --api_key string   Your CartoDB API Key (only needed for write operations)
  -c, --config string    Config file. Use a JSON file as a way to input these arguments.
  -h, --help
```

#### Examples

```
$ cartodb-import -u nerik --api_key XXX test.csv
$ cartodb-import -c config.json test.csv
$ cartodb-import test.csv # "config.json" will be used for credentials by default
$ cartodb-import --url http://sig.pilote41.fr/urbanisme/aleas_inondation/aleas_sauldre_shp.zip
```
