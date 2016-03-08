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

  request.post({
    url: this.maps_api_url,
    json: true,
    qs: {
      api_key: this.api_key
    },
    body: options.template
  }, function (err, res, body) {
    self._processResponse(err, res, body, promise);
  })

  return promise;
}

Named.prototype.instantiate = function(options) {
  debug('Instantiating named map: %s', options.template_id);

  var self = this;
  var promise = new _Promise();

  var url = this.maps_api_url + '/' + options.template_id;
  debug(url);

  var formData = (options.params) ? options.params : JSON.parse('{}');

  request.post({
    url: url,
    json: true,
    qs: {
      auth_token: options.auth_token
    },
    body: formData
  }, function (err, res, body) {
    self._processResponse(err, res, body, promise);
  })

  return promise;

}

Named.prototype.update = function(options) {
  debug('Updating Named Map %s', this.maps_api_url);

  var self = this;
  var promise = new _Promise();

  var url = this.maps_api_url + '/' + options.template.name;

  request.put({
    url: url,
    json: true,
    qs: {
      api_key: this.api_key
    },
    body: options.template
  }, function (err, res, body) {
    self._processResponse(err, res, body, promise);
  })

  return promise;
}

Named.prototype.delete = function(options) {
  debug('Attempting to delete named map: %s', options.template_id);
  
  var self = this;
  var promise = new _Promise();

  var url = this.maps_api_url + '/' + options.template_id;

  request.del({
    url: url,
    json: true,
    qs: {
      api_key: this.api_key
    }
  }, processResponse)

  //delete() needs special response handling and does not use _processResponse()
  function processResponse(err, res, body) {
    debug('Processing response', res.statusCode);

    if(!err && res.statusCode === 204) {
      debug('Success!');
      promise.emit('done', options.template_id);
    } else {
      debug('Error, %s', body.errors);
      promise.emit('_error', body.errors);
    }   
  };

  return promise;
}

Named.prototype.list = function(options) {

  var promise = new _Promise();
  var self = this;

  request.get({
    url: this.maps_api_url,
    json:true,
    qs: {
      api_key: this.api_key
    }
  }, function (err, res, body) {
    self._processResponse(err, res, body, promise);
  })

  return promise;
}

Named.prototype.definition = function(options) {
  
  var promise = new _Promise();
  var self = this;

  var url = this.maps_api_url + '/' + options.template_id;

  request.get({
    url: url,
    json:true,
    qs: {
      api_key: this.api_key
    }
  }, function (err, res, body) {
    self._processResponse(err, res, body, promise);
  })

  return promise;
}

Named.prototype._processResponse = function(err, res, body, promise) {
  debug('Processing response', res.statusCode);
    if(!err && res.statusCode === 200) {
      debug('Success!');
      promise.emit('done', body);
    } else {
      debug('Error, %s', body.errors);
      promise.emit('_error', body.errors);
    }
}

module.exports = {
  Named: Named
};
