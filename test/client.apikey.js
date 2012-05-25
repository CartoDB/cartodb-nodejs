var assert = require('assert');
var CartoDB = require('../');
var secret = require('./secret');
var shouldBehaveLikeASQLCLient = require('./client.oauth').shouldBehaveLikeASQLCLient;

describe('cartodb_apikey_client', function() {

  beforeEach(function(done){
    this.client = new CartoDB({
        user : secret.USER,
        api_key : secret.API_KEY});
    this.client.on('connect', function() {
        done();
    });

    this.client.connect();
  });

  describe('.is_write_query', function() {
      it("should return true for insert", function() {
          this.client.isWriteQuery("InSerT into table (bla) values ('meh')");
      });

      it("should return true for udpate", function() {
          this.client.isWriteQuery("UpDaTe table set bla=1");
      });

      it("should return true for delete", function() {
          this.client.isWriteQuery("DeLeTe from table");
      });

      it("should return false for select ", function() {
          this.client.isWriteQuery("select * from table");
      });
  });

  shouldBehaveLikeASQLCLient();

});

