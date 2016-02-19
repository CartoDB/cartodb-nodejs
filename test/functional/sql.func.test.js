var CartoDB = require('../../');
var assert = require('assert');

var credentials = require('../secret.js');

beforeEach(function(){
  this.SQL = new CartoDB.SQL(credentials);
});

describe('SQL', function() {
  describe('execute', function(){
    it('should return some results', function(done) {
      var sql = "select * from {{table}} limit 1";
      this.SQL.execute(sql, {table: credentials.EXISTING_TABLE}).done(function(data) {
        assert.strictEqual(data.rows.length, 1);
        done();
      }).error(function(e){
        throw new Error(e);
      });
    });
  })
});
