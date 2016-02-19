'use strict';

var Stream = require('stream')
  , util = require('util')


function _Promise() {}

util.inherits(_Promise, Stream);

//_Promise.prototype = Events;

_Promise.prototype.done = function(fn) {
    return this.on('done', fn);
}

//if the event is actually named 'error', will lead to Uncaught error if .error() is not called
//so name it _error and it doesn't matter if .error() is ever called or not
_Promise.prototype.error = function(fn) {
    return this.on('_error', fn);
}

module.exports = _Promise;
