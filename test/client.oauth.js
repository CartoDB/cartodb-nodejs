
var assert = require('assert');
var cartodb = require('../');
var secret = require('./secret');

/**
 * describes generic behaviour for a sql client 
 */
var shouldBehaveLikeASQLCLient = function() {

    it('should emit data with valid sql', function(done) {
        var sql = "select * from {table} limit 1";
        console.log(secret.EXISTING_TABLE);
        this.client.sql(sql, {table: secret.EXISTING_TABLE});
        this.client.on('data', function(data) {
            var response = JSON.parse(data);
            assert.equal(1, response.total_rows);
            done();
        });
    });

    it('should emit error with valid invalid sql', function(done) {
        var sql = "select * from {table} limit 1";
        this.client.sql(sql, {table: 'ASDASDASDASDASDassaDDS'});
        this.client.on('error', function(data) {
            assert.ok(data.statusCode !== undefined);
            assert.ok(JSON.parse(data.data).error !== undefined);
            done();
        });
    });

    it('should be able to do write operations', function(done) {
        var sql = "insert into {table} (name) values ('test')";
        this.client.sql(sql, {table: secret.EXISTING_TABLE});
        this.client.on('data', function(data) {
            done();
        });
    });


};

describe('cartodb_oauth_client', function() {
  beforeEach(function(done){
    this.client = new cartodb.CartoDBClient(
        secret.USER,
        secret.password,
        secret.CONSUMER_KEY, 
        secret.CONSUMER_SECRET);
    this.client.connect();
    this.client.on('connect', function() {
        done();
    });
  });

  shouldBehaveLikeASQLCLient();

});


module.exports = {
    shouldBehaveLikeASQLCLient: shouldBehaveLikeASQLCLient
};
