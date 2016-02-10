
/*
 * Module dependencies
 */

var Stream = require('stream')
  , util = require('util')
  , request = require('request')
  , debug = require('debug')('cartodb')
  , resources = require('./resources.json')
  , Promise = require('bluebird')
  , _ = require('underscore')
  , SQL = require('./sql');

/*
 * Constructor
 *
 * @config {Object} Connection params
 *
 * @api public
 */

function CartoDB(config) {

  //Stream.call(this);

  for(var i in config){
    this[i] = config[i];
  }

  this.sql_api_url = this.sql_api_url || resources.sql_api_url.replace(':user', this.user);


  this.SQL = SQL;

  return this;
}

/*
 * Inheritance
 */

util.inherits(CartoDB, Stream);


/*
 * Query the database
 *
 * @param {String} sql statement
 * @param {Object} arguments
 * @param {Function} fn
 */

CartoDB.prototype.query = function(_sql, args, cb) {

  var self = this;

  if("undefined" == typeof cb) {
    if("function" == typeof args) {
      cb = args;
      args = {};
    } else {
      cb = function(){}; //noop
    }
  }

  var sql =  tmpl(_sql, args);

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
    console.log(body);
    if(!err && res.statusCode==200) {
      debug('Successful response from the server');
      self.emit('data', JSON.stringify(body));
      cb(null, body);
    } else {
      debug('There was an error with the request %s', body.error);
      cb(body.error, null)
    }
  }

  return this;
};


CartoDB.prototype.import = function(filepath, args, cb) {

  console.log(filepath);

  var self = this;

  if("undefined" == typeof cb) {
    if("function" == typeof args) {
      cb = args;
      args = {};
    } else {
      cb = function(){}; //noop
    }
  }

  setTimeout(function(){
    self.emit('done',{message:'hello'},'obj1');
  },3000);

  return this;

};

CartoDB.prototype.done = function(cb) {
  return this.on('done',cb)
};


/*
 * Utilities
 */

/**
 * renders a template
 * tmpl("Hi {name}", {name: 'rambo'}) renders "Hi rambo"
 */

var tmpl = CartoDB.tmpl = function(s,d){
  for(var p in d) s = s.replace(new RegExp('{'+p+'}', 'g'), d[p]);
  return s;
};

/*
 * check if the user wants to write to the db
 */

var isWriteQuery = CartoDB.prototype.isWriteQuery = function(sql) {
    return /insert|delete|update|alter/gi.test(sql);
};

/*
 * Exports the constructor
 */

module.exports = CartoDB;
