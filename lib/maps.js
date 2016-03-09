'use strict';

var Stream = require('stream')
  , util = require('util')
  , request = require('request')
  , debug = require('debug')('cartodb')
  , resources = require('./resources.json')
  , Mustache = require('mustache')
  , _Promise = require('./promise')
  , fs = require('fs')
  ;

/*
 * Inheritance
 */

util.inherits(Named, Stream);


function Named(config) {

  for(var i in config){
    this[i] = config[i];
  }

  this.maps_api_url = this.maps_api_url || Mustache.render(resources.maps_api_url, config);

  return this;
}

Named.prototype.create = function(options) {
  debug('POSTing your template to %s', this.maps_api_url);

  var self = this;
  var promise = new _Promise();

  var requestOptions = {
    url: this.maps_api_url,
    qs: {
      api_key: this.api_key
    },
    body: options.template
  }

  this._request('post', requestOptions, promise)

  return promise;
}

Named.prototype.instantiate = function(options) {
  debug('Instantiating named map: %s', options.template_id);

  var self = this;
  var promise = new _Promise();

  var url = this.maps_api_url + '/' + options.template_id;
  debug(url);

  var formData = (options.params) ? options.params : JSON.parse('{}');

  var requestOptions = {
    url: url,
    qs: {
      auth_token: options.auth_token
    },
    body: formData
  }

  this._request('post', requestOptions, promise)

  return promise;

}

Named.prototype.update = function(options) {
  debug('Updating Named Map %s', this.maps_api_url);

  var self = this;
  var promise = new _Promise();

  var requestOptions = {
    url: this.maps_api_url + '/' + options.template.name,
    json: true,
    qs: {
      api_key: this.api_key
    },
    body: options.template
  }

  this._request('put', requestOptions, promise)

  return promise;
}


Named.prototype.delete = function(options) {
  debug('Attempting to delete named map: %s', options.template_id);
  
  var self = this;
  var promise = new _Promise();

  var requestOptions = {
    url: this.maps_api_url + '/' + options.template_id,
    qs: {
      api_key: this.api_key
    }
  };

  this._request('del', requestOptions, promise)

  return promise;
}



Named.prototype.list = function(options) {

  var promise = new _Promise();
  var self = this;

  var requestOptions = {
    url: this.maps_api_url,
    qs: {
      api_key: this.api_key
    }
  }

  this._request('get',requestOptions, promise);

  return promise;
}

Named.prototype.definition = function(options) {
  
  var promise = new _Promise();
  var self = this;

  var requestOptions = {
    url: this.maps_api_url + '/' + options.template_id,
    qs: {
      api_key: this.api_key
    }
  };

  this._request('get', requestOptions, promise);

  return promise;
}

Named.prototype._request = function( method, options, promise ) {
  var self = this;

  options.json = true

  request[method](options, function (err, res, body) {
    self._processResponse(err, res, body, method, promise);
  });
}


Named.prototype._processResponse = function(err, res, body, method, promise) {
  debug('Processing response', res.statusCode);
    if(method != 'del') {
      if(!err && res.statusCode === 200) {
        debug('Success!');
        promise.emit('done', body);
      } else {
        debug('Error, %s', body.errors);
        promise.emit('_error', body.errors);
      }      
    } else { //handle delete differently
      if(!err && res.statusCode === 204) {
        debug('Success!');
        promise.emit('done', {success: true});
      } else {
        debug('Error, %s', body.errors);
        promise.emit('_error', body.errors);
      } 
    }

}


module.exports = {
  Named: Named
};
