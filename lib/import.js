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

  debug('POSTing your file to %s', self.import_api_url);
  var req = request.post({
    url: self.import_api_url,
    json: true, 
    qs: { 
      api_key: this.api_key
    }
  }, function (err, resp, body) {
     if (err) {
       console.log('Error!');
     } else {
      console.log(body);
      debug('Success, the item_queue_id is %s', body.item_queue_id)
      if(body.item_queue_id) {
        poll(body.item_queue_id);
      }
       //self.emit('done', body);
     }
   });

   var form = req.form();
   form.append('file', fs.createReadStream(filepath));



   function poll(queue_id) {
      debug('Polling to see if this file is finished importing...')
      setTimeout(function() {
        var pollUrl = self.import_api_url + '/' + queue_id;

        request.get({url: pollUrl, json: true, qs: { 
              api_key: self.api_key
            }
          }, function(err, res, body) {
            if( body.state != 'complete' ) {
              debug('Not finished, trying again...')
              poll(queue_id)
            } else {
              debug('It\'s finished! The table name is %s', body.table_name);
              self.emit('done', body.table_name)
            }
          });
      },3000)

    }




  return this;
};





Import.prototype.done = function(cb) {
  return this.on('done',cb)
};



/*
 * Exports the constructor
 */


module.exports = Import;