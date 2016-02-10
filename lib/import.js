var Stream = require('stream')
  , util = require('util')
  , request = require('request')
  , debug = require('debug')('cartodb')
  , resources = require('./resources.json')
  , Mustache = require('mustache')
  , fs = require('fs')
  ;




/*
 * Constructor
 *
 * @config {Object} Connection params
 *
 * @api public
 */

function Import(config) {

  //Stream.call(this);

  for(var i in config){
    this[i] = config[i];
  }

  this.import_api_url = this.import_api_url || resources.import_api_url.replace(':user', this.user);

  return this;
}

/*
 * Inheritance
 */

util.inherits(Import, Stream);

Import.prototype.file = function(filepath, args) {

  console.log(filepath);

  var self = this;

  var req = request.post({
    url: this.import_api_url, 
    qs: { 
      api_key: this.api_key
    }
  }, function (err, resp, body) {
     if (err) {
       console.log('Error!');
     } else {
       console.log('Response: ' + body);
       self.emit('done', body);
     }
   });

   var form = req.form();
   form.append('file', fs.createReadStream(filepath));

  return this;
};


Import.prototype.done = function(cb) {
  return this.on('done',cb)
};



/*
 * Exports the constructor
 */


module.exports = Import;