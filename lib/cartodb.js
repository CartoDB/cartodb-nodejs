
/*
 * Module dependencies
 */

var qs = require('querystring')
  , OAuth = require('oauth').OAuth
  , Stream = require('stream').Stream
  , util = require('util')
  , request = require('superagent')
  , debug = require('debug')('cartodb')
  , resources = require('./resources.json');

require('superagent-oauth')(request);

/*
 * Constructor
 *
 * @param {Object} Connection params
 *
 * @api public
 */

function CartoDB(params) {

  Stream.call(this);

  for(var i in params){
    this[i] = params[i];
  }

  this.api_url = resources.api_url.replace(':user', this.user);
  this.request_url = resources.request_url.replace(':user', this.user);
  this.access_url = resources.access_url.replace(':user', this.user);

  if(this.consumer_key && this.consumer_secret) {
    this.signed = true;
    this.generateOAuth();
  }

  return this;
}

/*
 * Inheritance
 */

util.inherits(CartoDB, Stream);

/*
 * Generate OAuth urls
 */

CartoDB.prototype.generateOAuth = function() {

  this.oa = new OAuth(
      this.request_url
    , this.access_url
    , this.consumer_key
    , this.consumer_secret
    , "1.0"
    , null
    , "HMAC-SHA1"
  );

};

/*
 * Connect to CartoDB
 *
 * @api public
 */

CartoDB.prototype.connect = function() {
  if(this.signed) {
    this.connectOAuth();
  } else {
    this.emit('connect');
  }
};

/*
 * Connect to CartoDB using OAuth
 */

CartoDB.prototype.connectOAuth = function() {
  var self = this;
  debug('Starting OAuth connection process');
  this.oa.getOAuthRequestToken(function(error, request_key, request_secret, results){
    if(error) {
      debug('Error trying to connect %s', error);
      throw error;
    } else {
      // Configure XAuth request
      var xauth = {
          x_auth_mode: "client_auth"
        , x_auth_username: self.user
        , x_auth_password: self.password
      };

      self.requestToken(request_key, xauth);
    }
  });
};

/*
 * Request access token
 */

CartoDB.prototype.requestToken = function(request_key, xauth) {
  debug('Requesting OAuth token');
  var self = this;

  // Request access key and secret tokens via XAuth
  this.oa.post(this.access_url, request_key, null, xauth, null, function(error, data) {
    if(error) {
      debug('Error trying to get access token %s', error);
      throw error;
    }
    else {
      // Parse access tokens from returned query string
      var access_tokens = qs.parse(data);
      self.access_key = access_tokens['oauth_token'];
      self.access_secret = access_tokens['oauth_token_secret'];
      debug('Successfully connected via OAuth: Access token %s - Access secret %s', self.access_key, self.access_secret);
      self.emit('connect');
    }
  });
};

/*
 * Close the connection
 *
 * @api public
 */

CartoDB.prototype.close = function() {
  //do nothing yet, leave nodejs manage the connection pool
  debug('Connection closed');
};

/*
 * Query the database
 *
 * @param {String} sql statemente
 * @param {Object} arguments
 * @param {Function} fn
 */

CartoDB.prototype.query = function(_sql, args, fn) {

  var self = this;

  if("undefined" == typeof fn) {
    if("function" == typeof args) {
      fn = args;
      args = {};
    } else {
      fn = function(){}; //noop
    }
  }

  var sql =  tmpl(_sql, args);

  var method = (sql.length > 2048 || isWriteQuery(sql)) ? 'POST' : 'GET';

  debug('About to perform a %s query to %s', method, self.api_url);

  var req = request(method, this.api_url)
            .type("form")
            .query({q: sql, api_key: this.api_key});

  if(this.signed)
    req.sign(this.oa, this.access_key, this.access_secret);

  req.end(function(res){
    if(res.ok) {
      debug('Successful response from the server');
      self.emit('data', res.text + '\n');
      fn(null, res.body);
    } else {
      debug('There was an error with the request %s', res.text);
      fn(res.text, null);
    }
  });

  return this;
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
