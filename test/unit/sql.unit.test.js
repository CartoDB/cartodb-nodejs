var CartoDB = require('../../');
var assert = require('assert');

var dummyCredentials = {user: 'someuser', api_key: 'somelongstring'};

beforeEach(function(){
  this.dummySQL = new CartoDB.SQL(dummyCredentials);
});

describe('SQL', function() {


  describe('constructor', function() {
    context('when not providing sql_api_url', function() {
      it('should have a correct sql_api_url defined', function () {
        assert.strictEqual(this.dummySQL.sql_api_url, 'https://someuser.cartodb.com/api/v2/sql');
      });

    });
    context('when providing sql_api_url', function() {
      it('should have a correct sql_api_url defined', function () {
        var options = dummyCredentials;
        options.sql_api_url = 'https://someuser.cartodb.com/api/v2/sql';
        var sql = new CartoDB.SQL(options);
        assert.strictEqual(sql.sql_api_url, 'https://someuser.cartodb.com/api/v2/sql');
      });
    });

  });

  describe('isWriteQuery', function() {
    it('should detect an INSERT as a write query', function () {
      assert.strictEqual(this.dummySQL.isWriteQuery('InSerT into table (bla) values (\'meh\')'), true);
    });
    it('should detect an UPDATE as a write query', function () {
      assert.strictEqual(this.dummySQL.isWriteQuery('UpDaTe table set bla=1'), true);
    });
    it('should detect an DELETE as a write query', function () {
      assert.strictEqual(this.dummySQL.isWriteQuery('DeLeTe from table'), true);
    });
    it('should detect a SELECT as a read query', function () {
      assert.strictEqual(this.dummySQL.isWriteQuery('select * from table'), false);
    });

  });

  describe('execute', function() {
    it('should throw an error when user does not provide query', function () {
      assert.throws(function() {
        this.dummySQL.execute('');
      });
    });
  });

});
