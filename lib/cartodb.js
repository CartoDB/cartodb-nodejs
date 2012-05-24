
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
 * @param {Object} 
 */

function CartoDB(params) {

  for(var i in params){
    this[i] = params[i];
  }

  this.oa = new OAuth(
      resources.request_url.replace(":user", this.user)
    , resources.access_url.replace(":user", this.user)
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

CartoDBClient.prototype.connect = function() {
    var self = this;
    debug('connecting');
    self.oa.getOAuthRequestToken(function(error, request_key, request_secret, results){
        if(error) log('error :' + error);
        else {
            debug('\n== Request Tokens ==');
            debug('request key :' + request_key);
            debug('request secret :' + request_secret);

            // Configure XAuth request
            var xauth = {x_auth_mode:"client_auth", x_auth_username: self.user , x_auth_password: self.password };

            // Request access key and secret tokens via XAuth
            // ** NOTE: Do NOT post the request_secret in argument 3 **
            debug("\nRequesting access tokens via XAuth...");
            self.oa.post(self.cartodb_access_url, request_key, null, xauth, null, function(error, data) {
                if(error) {
                    debug(util.inspect(error));
                    throw new Error("...XAuth failed. Please check your password and username.");
                } else {
                    debug("...XAuth successful!");

                    // Parse access tokens from returned query string
                    var access_tokens = qs.parse(data);
                    self.access_key    = access_tokens['oauth_token'];
                    self.access_secret = access_tokens['oauth_token_secret'];
                    self.emit('connect');
                }
            });
        }
    });
}

/**
 * renders a template
 * tmpl("Hi {name}", {name: 'rambo'}) renders "Hi rambo"
 */
function tmpl(s,d){
 for(var p in d)
   s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
 return s;
}

/**
 * executes a sql sentence in cartodb. When request is complete 'data' event is emitted, if something went wroing 'error'
 * is emitted
 */
CartoDBClient.prototype.sql = function(_sql, args) {

    var sql =  tmpl(_sql, args);
    debug("sending", sql)
    var self = this;
    function _response(error, data, response) {
        if(error) {
            self.emit('error', error);
        } else {
            self.emit('data', data, response);
        }
    }
    if(sql.length > 2048) {
        var protected_request = this.cartodb_api_url + "?q=" + qs.escape(sql);
        this.oa.get(protected_request, this.access_key, this.access_secret,  _response);
    } else {
        var protected_request = this.cartodb_api_url;
        var body = {q: sql}
        this.oa.post(protected_request, this.access_key, this.access_secret, body, null, _response)
    }
}


function CartoDBClientApiKey(user, api_key) {
    this.opt = {}
    this.user = user;
    this.api_key = api_key;
    this.cartodb_host = user + '.cartodb.com';
    this.cartodb_api_path = '/api/v1/sql';
}

CartoDBClientApiKey.prototype = new EventEmitter();

CartoDBClientApiKey.prototype.connect = function(callback) {
    this.opt.keep_alive = true;
    this.emit('connect');

};

CartoDBClientApiKey.prototype.is_write_query = function(_sql) {
    var sql_lower = _sql.toLowerCase();
    var isWrite = sql_lower.indexOf('insert') !== -1 ||
                  sql_lower.indexOf('delete') !== -1  ||
                  sql_lower.indexOf('update') !== -1;
    return isWrite;
}

CartoDBClientApiKey.prototype.close = function() {
    //do nothing yet, leave nodejs manage the connection pool
};

CartoDBClientApiKey.prototype.sql = function(_sql, args) {
    var self = this;
    var sql =  tmpl(_sql, args);
    debug("SQL: " + sql);

    var options = {
       host: this.cartodb_host,
       port: 443,
       headers: {}// {'Connection': 'keep-alive'} // stay connected
    };

    if(this.opt.keep_alive) {
       options.headers['Connection'] = 'keep-alive';
    }

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

