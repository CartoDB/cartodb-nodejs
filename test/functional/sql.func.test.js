var CartoDB = require('../../');
var assert = require('assert');

var credentials = require('../secret.js');

beforeEach(function(){
  this.SQL = new CartoDB.SQL(credentials);
  this.Import = new CartoDB.Import(credentials);
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
  });
});


describe('Import', function() {
  this.timeout(300000);
  describe('file', function(){
    it('should create a new table', function(done) {
      this.Import.file(__dirname + '/../../examples/import-file/all_week.csv',{}).done(function(table_name) {
        assert.notEqual(typeof table_name, undefined);
      })
    })
  });
});