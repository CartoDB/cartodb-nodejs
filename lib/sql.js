'use strict';

var Stream = require('stream')
  , util = require('util')
  , request = require('request')
  , debug = require('debug')('cartodb')
  , resources = require('./resources.json')
  , Mustache = require('mustache')
  , _Promise = require('./promise')
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


//sql.execute(sql [,vars][, options][, callback])Permalink
SQL.prototype.execute = function(sql, vars, options, cb) {

  var self = this;

  var MAX_LENGTH_GET_QUERY = 1024;

  var promise = new _Promise();
    if(!sql) {
      throw new Error('sql should not be null');
    }

  //check if last argument is a function
  var args = arguments,
  fn = args[args.length -1];
  if(typeof(fn) == 'function') cb = fn;

    //if no brackets in sql, 2nd argument should be options
  if(sql.match(/({{|}})/) === null) {
    options = vars;
  }

  var query =  Mustache.render(sql, vars);

  // check method: if we are going to send by get or by post
  var isGetRequest = query.length < MAX_LENGTH_GET_QUERY;

  debug('About to perform a query to %s', self.sql_api_url);

  var params = {
    q: query,
    api_key: this.api_key
  }

  if(options) {
    params = util._extend(params, options);
  }

  //TODO: why use POST if it's a write query?
  if (isGetRequest && !isWriteQuery(query)) {
    request.get({
      url: this.sql_api_url,
      json: true,
      qs: params
    }, processResponse);
  } else {
    request.post({url: this.sql_api_url, json: true, form: params
    }, processResponse);
  }

  function processResponse(err, res, body) {
    if(!err && res.statusCode === 200) {
      debug('Successful response from the server');
      self.emit('data', JSON.stringify(body));
      promise.emit('done', body);
      if(cb) cb(body);
    } else {
      debug('There was an error with the request %s', body.error);
      promise.emit('_error', body.error);
    }
  }

  return promise;
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

module.exports = SQL;
