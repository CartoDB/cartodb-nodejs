var assert = require('assert');
var cartodb = require('../');
var secret = require('./secret');
var shouldBehaveLikeASQLCLient = require('./client.oauth').shouldBehaveLikeASQLCLient;

describe('cartodb_apikey_client', function() {

  beforeEach(function(done){
    this.client = new cartodb.CartoDBClientApiKey(
        secret.USER,
        secret.API_KEY);
    this.client.on('connect', function() {
        done();
    });
    this.client.connect();
  });

  describe('.is_write_query', function() {
      it("should return true for insert", function() {
          this.client.is_write_query("InSerT into table (bla) values ('meh')");
      });

      it("should return true for udpate", function() {
          this.client.is_write_query("UpDaTe table set bla=1");
      });

      it("should return true for delete", function() {
          this.client.is_write_query("DeLeTe from table");
      });

      it("should return false for select ", function() {
          this.client.is_write_query("select * from table");
      });
  });

  shouldBehaveLikeASQLCLient();

});

