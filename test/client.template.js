var assert = require('assert');
var CartoDB = require('../');
var secret = require('./secret');

describe('Templates', function() {

  describe('Can handle multiple ocurrences', function() {

      it("should return true for insert", function(done) {
        var template = CartoDB.tmpl("InSerT into table {table_id} values ({id}, {table_id}, {id})", {id: 1, table_id: 45});
        assert.equal(template, "InSerT into table 45 values (1, 45, 1)");  
        done();
      });
  });

});

