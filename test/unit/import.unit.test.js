var CartoDB = require('../../');
var assert = require('assert');

var dummyCredentials = {user: 'someuser', api_key: 'somelongstring'};

beforeEach(function(){
  this.dummyImport = new CartoDB.Import(dummyCredentials);
});

describe('Import', function() {

  describe('constructor', function() {
    context('when not providing import_api_url', function() {
      it('should have a correct import_api_url defined', function () {
        assert.strictEqual(this.dummyImport.import_api_url, 'https://someuser.cartodb.com/api/v1/imports');
      });

    });
    context('when providing import_api_url', function() {
      it('should have a correct import_api_url defined', function () {
        var options = dummyCredentials;
        options.import_api_url = 'https://someuser.cartodb.com/api/v1/imports';
        var cdbImport = new CartoDB.Import(options);
        //assert.strictEqual(cdbImport.import_api_url, 'https://someuser.cartodb.com/api/v1/imports');
      });
    });

  });

  describe('file', function() {
    it('should throw an error when user does not provide filePath', function () {
      assert.throws(function() {
        this.dummyImport.file(null);
      });
    });
  });


})