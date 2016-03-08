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
    var self = this;
    this._create(options);
}

Named.prototype._create = function(options) {

  debug('POSTing your template to %s', this.maps_api_url);

  var formData = JSON.parse(fs.readFileSync(options.filePath, 'utf8'))

  var req = request.post({
    url: this.maps_api_url,
    json: true,
    qs: {
      api_key: this.api_key
    },
    body: formData
  }, processResponse)


  function processResponse(err, res, body) {
    console.log('processing response');
    if (err) {
     console.log(err);
    } else {
     console.log(body);
    }
  }
}

Named.prototype.delete = function(options) {
  var self = this;
  this._delete(options);
}

Named.prototype._delete = function(options) {
  debug('Deleting named map at %s', this.maps_api_url);

  var url = this.maps_api_url + '/' + options.template_name;

  var req = request.del({
    url: url,
    qs: {
      api_key: this.api_key
    }
  }, processResponse)


  function processResponse(err, res, body) {
    console.log('processing response');
    if (err) {
     console.log(err);
    } else {
     console.log('Deleted');
    }
  }
}

Named.prototype.list = function(options) {

  var promise = new _Promise();

  var req = request.get({
    url: this.maps_api_url,
    qs: {
      api_key: this.api_key
    }
  }, processResponse)

  function processResponse(err, res, body) {
    console.log('processing response');
    if (err) {
     promise.emit('_error', body.error);
    } else {
     promise.emit('data', JSON.parse(body));
    }
  }

  return promise;

}

module.exports = {
  Named: Named
};
