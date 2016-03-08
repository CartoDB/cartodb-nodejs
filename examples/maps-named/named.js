var CartoDB = require('../..');
var cdb_config = require('../config.js');

var namedMaps = new CartoDB.Maps.Named(cdb_config);

// namedMaps.delete({
//   template_name: 'template_name'
// });

// namedMaps.create({
//   filePath: __dirname + '/' + 'template.json'
// });
  
namedMaps.list()
  .on('data', function(data) {
    console.log(data);
  });

