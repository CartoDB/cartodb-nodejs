'use strict';

var Stream = require('stream')
  , util = require('util')
  , request = require('request')
  , debug = require('debug')('cartodb:import')
  , resources = require('./resources.json')
  , Mustache = require('mustache')
  , fs = require('fs')
  , _Promise = require('./promise')
  , requestUtil = require('./util/request')
  ;


/*
 * Constructor
 *
 * @config {Object} Connection params
 *
 * @api public
 */

function Import(config) {

  for(var i in config){
    this[i] = config[i];
  }

  this.import_api_url = this.import_api_url || Mustache.render(resources.import_api_url,config);

  return this;
}

/*
 * Inheritance
 */

util.inherits(Import, Stream);

Import.prototype.file = function(filePath, options) {

  var self = this;

  var promise = new _Promise();
  if(!filePath) {
    throw new TypeError('filePath should not be null');
  }

  if (!options) options = {};
  options.filePath = filePath;
  options.promise = promise;
  this._post('file',options);

  return promise;
};


Import.prototype.url = function(url, options) {

  var self = this;

  var promise = new _Promise();
  if(!url) {
    throw new TypeError('url should not be null');
  }

  if (!options) options = {};
  options.url = url;
  options.promise = promise;
  this._post('url',options);

  return promise;
};


Import.prototype._post = function(type, options) {

  var self = this,
    req,
    reqOptions,
    defaultReqOptions = {
      url: self.import_api_url,
      json: true,
      qs: {
        api_key: self.api_key,
        privacy: options.privacy
      }
    };

  reqOptions = options.reqOptions || defaultReqOptions;

  debug(reqOptions)
  debug('POSTing your file to %s', self.import_api_url);

  req = reqOptions.method ? request(reqOptions, processResponse)
    : request.post(reqOptions, processResponse);

  if(type === 'file') {
    req.form().append('file', fs.createReadStream(options.filePath));
  }

  if(type === 'url') {
    req.form().append('url', options.url);
  }

  function processResponse(err, res, body) {
    if (err) {
      debug('processResponse error defined')
      debug(err, true)
      options.promise.emit('_error', err);
    } else {
      body = requestUtil.fixBody(body);

      debug(body);
      debug('Success, the item_queue_id is %s', body.item_queue_id);
      if(body.item_queue_id) {
        poll(body.item_queue_id);
      }
      else
        options.promise.emit('_error', 'body.item_queue_id undefined');
    }
  }


  function poll(queue_id) {
    debug('Polling to see if this file is finished importing...')
    setTimeout(function() {
    var pollUrl = self.import_api_url + '/' + queue_id;

      var getOptions = {
        url: pollUrl,
        json: true,
        qs: {
          api_key: self.api_key
        }
      };

      debug(getOptions);

      request.get(getOptions, processGetResponsefunction);


      function processGetResponsefunction(err, res, body) {

        body = requestUtil.fixBody(body);

        debug('statusCode: %s', res.statusCode)

        debug('Processing Import Status Response')
        debug(body);

        try {

          if( body.state == 'complete' ) {
            debug('It\'s finished! The table name is %s', body.table_name);
            options.promise.emit('done', body.table_name)

          } else if( body.state == 'failure') {
            debug('import failure')
            if(!body.get_error_text && !body.error_code)
              debug('body.get_error_text and body.error_code is undefined');

            var msg = body.get_error_text? JSON.stringify(body.get_error_text) : body.error_code.toString();
            options.promise.emit('_error', new Error(msg));

          } else {
            debug('Not finished, trying again...');
            poll(queue_id); //recurse
          }
        }
        catch (err) {
          debug('processGetResponse: try catch error')
          debug(err)
          options.promise.emit('_error', err);
        }
      };

    },3000);
  }
}


/*
 * Exports the constructor
 */


module.exports = Import;
