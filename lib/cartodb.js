
/*
 * Module dependencies
 */

var   qs = require('querystring')
    , OAuth = require('oauth').OAuth
    , EventEmitter = require('events').EventEmitter
    , util = require('util')
    , https = require('https')
    , resources = require('./resources.json');

/*
 * Alias
 */

var debug = util.debug
  , log = util.log;

/*
 * Constructor  
 *
 * @param {Object} Connection params
 *
 * @api public
 */

function CartoDB(params) {

  for(var i in params){
    this[i] = params[i];
  }

  this.api_url = resources.api_url.replace(':user', this.user);

  if(this.request_url && this.access_url){
    this.request_url = resources.request_url.replace(':user', this.user);
    this.access_url = resources.access_url.replace(':user', this.user);

    this.connect = this.connectOAuth;
    this.query = this.queryOAuth;
  }

  this.oa = new OAuth(
      this.request_url    
    , this.access_url    
    , this.consumer_key
    , this.consumer_secret
    , "1.0"
    , null
    , "HMAC-SHA1");
}

/*
 * Inheritance
 */

util.inherits(CartoDB, EventEmitter);

/*
 * Connect to CartoDB
 *
 * @api public
 */

CartoDB.prototype.connectOAuth = function() {

  var self = this;
  self.oa.getOAuthRequestToken(function(error, request_key, request_secret, results){
    if(error) throw error;        
    else {

      // Configure XAuth request
      var xauth = {
          x_auth_mode: "client_auth"
        , x_auth_username: self.user 
        , x_auth_password: self.password 
      };

      // Request access key and secret tokens via XAuth
      // ** NOTE: Do NOT post the request_secret in argument 3 **
      self.oa.post(self.access_url, request_key, null, xauth, null, function(error, data) {
        if(error) throw error;
        else {

          // Parse access tokens from returned query string
          var access_tokens = qs.parse(data);
          self.access_key = access_tokens['oauth_token'];
          self.access_secret = access_tokens['oauth_token_secret'];
          self.emit('connect');
        }
      });
    }
  });
};

/**
 * executes a sql query in cartodb. 
 * When request is complete 'data' event is emitted, 
 * if something went wrong 'error'
 * is emitted
 *
 * @param {String} sql query
 * @param {Object} arguments
 * @api public
 */

CartoDB.prototype.queryOAuth = function(_sql, args) {

  var self = this;

  var sql = tmpl(_sql, args);
  function _response(error, data, response) {
    if(error) self.emit('error', error);
    else self.emit('data', data, response);
  }

  if(sql.length > 2048) 
    this.oa.get(
        this.api_url + "?q=" + qs.escape(sql)
      , this.access_key
      , this.access_secret
      ,  _response
    );

  else
    this.oa.post(
        this.api_url
      , this.access_key
      , this.access_secret
      , {q: sql}
      , null
      , _response
    );

};

/*
 * Connect with the server
 *
 * @api public
 */

CartoDB.prototype.connect = function() {
  this.emit('connect');
};

/*
 * Close the connection
 *
 * @api public
 */

CartoDB.prototype.close = function() {
  //do nothing yet, leave nodejs manage the connection pool
};

CartoDB.prototype.query = function(_sql, args) {
  var self = this;
  var sql =  tmpl(_sql, args);

  var options = {
    host: this.cartodb_host,
    port: 443,
    headers: {
      'Connection': 'keep-alive'
    }    
  };


  var params = "q=" + qs.escape(sql) + "&api_key="+ this.api_key;
  if(sql.length > 2048 || this.is_write_query(sql)) {
        options.method = "POST";
        options.headers['Content-type'] = 'application/x-www-form-urlencoded';
        options.headers['Content-length'] = params.length;
        options.path = this.cartodb_api_path;
    } else {
        options.method = "GET";
        options.path = this.cartodb_api_path + "?" + params;

    }

    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(d) {
          res.setEncoding('utf8');
          data += d;
      });

      res.on('end', function() {
          if(res.statusCode === 200) {
            self.emit('data', data);
          } else {
            self.emit('error', { statusCode: res.statusCode, data: data});
          }
      });

    });

    if(options.method === "POST") {
        req.write(params);
    }
    req.end();
    req.on('error', function(d) {
        self.emit('error', d);
    });

};


module.exports = {
    CartoDBClient: CartoDBClient,
    CartoDBClientApiKey: CartoDBClientApiKey
}


/*
 * Utilities
 */


/**
 * renders a template
 * tmpl("Hi {name}", {name: 'rambo'}) renders "Hi rambo"
 */

function tmpl(s,d){
 for(var p in d) s = s.replace('{'+p+'}', d[p]);
 return s;
}

/*
 * check if the user wants to write to the db
 */

function isWriteQuery = function(sql) {
    return !/(insert|delete|update)/gi.test(sql);
}
