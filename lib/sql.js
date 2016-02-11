var Stream = require('stream')
  , util = require('util')
  , request = require('request')
  , debug = require('debug')('cartodb')
  , resources = require('./resources.json')
  , Mustache = require('mustache')
  ;


/*
 * Constructor
 *
 * @config {Object} Connection params
 *
 * @api public
 */

function SQL(config) {

  for(var i in config){
    this[i] = config[i];
  }

  this.sql_api_url = this.sql_api_url || Mustache.render(resources.sql_api_url, config);

  return this;
}

/*
 * Inheritance
 */

util.inherits(SQL, Stream);

SQL.prototype.execute = function(_sql, args) {

  var self = this;

  var sql =  Mustache.render(_sql, args);

  debug('About to perform a query to %s', self.sql_api_url);
  var req;
  if (sql.length > 2048 || isWriteQuery(sql)) {
    // use post for large queries
    req = request.post({url: this.sql_api_url, json: true, form: { 
        q: sql, 
        api_key: this.api_key
      }
    }, processResponse);  
  } else {
    req = request.get({url: this.sql_api_url, json: true, qs: { 
        q: sql, 
        api_key: this.api_key
      }
    }, processResponse);      
  }


  function processResponse(err, res, body) {
    if(!err && res.statusCode==200) {
      debug('Successful response from the server');
      self.emit('data', JSON.stringify(body));
      self.emit('done', body);
    } else {
      debug('There was an error with the request %s', body.error);
      self.emit('error', body.error);
    }
  }

  return this;
};


SQL.prototype.done = function(cb) {
  return this.on('done',cb)
};

SQL.prototype.error = function(cb) {
  return this.on('error',cb)
};

/*
 * Utilities
 */


/*
 * check if the user wants to write to the db
 */

var isWriteQuery = SQL.prototype.isWriteQuery = function(sql) {
    return /insert|delete|update|alter/gi.test(sql);
};

/*
 * Exports the constructor
 */


module.exports = SQL;