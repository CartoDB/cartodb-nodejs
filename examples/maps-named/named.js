var CartoDB = require('../..');
var cdb_config = require('../config.js');
var fs = require('fs');

var namedMaps = new CartoDB.Maps.Named(cdb_config);

//create a named map from template.json

var filePath = __dirname + '/' + 'template.json';
var template = JSON.parse(fs.readFileSync(filePath, 'utf8'))

namedMaps.create({
  template: template
})
  .on('done', function(res) {
    console.log(res)
  })
  .on('_error', function(res) {
    console.log(res)
  });

//instantiate a named map with auth_token and params

namedMaps.instantiate({
  template_id: 'world_borders',
  auth_token: 'auth_token1', 
  params: {
    color: '#ff0000',
    cartodb_id: 3
  }
})
  .on('done', function(res) {
    console.log(res)
  })
  .on('_error', function(res) {
    console.log(res)
  });

// //instantiate a named map with auth_token

namedMaps.instantiate({
  template_id: 'world_borders',
  auth_token: 'auth_token1'
})
  .on('done', function(res) {
    console.log(res)
  })
  .on('_error', function(res) {
    console.log(res)
  });;
  

//update a named map

var filePath = __dirname + '/' + 'updateTemplate.json';
var template = JSON.parse(fs.readFileSync(filePath, 'utf8'))

namedMaps.update({
  template: template
})
  .on('done', function(res) {
    console.log(res)
  })
  .on('_error', function(res) {
    console.log(res)
  });

// delete a named map

namedMaps.delete({
  template_id: 'world_borders'
})
  .on('done', function(res) {
    console.log(res);
  })
  .on('_error', function(error) {
    console.log(error);
  });

//get a list of all named maps in your account

namedMaps.list()
  .on('done', function(res) {
    console.log(res);
  });

//get the definition of a named map
namedMaps.definition({
  template_id: 'world_borders'
})
  .on('done', function(res) {
    console.log(res);
  });

