
var assert = require('assert');
var CartoDB = require('../');
var secret = require('./secret');

/**
 * describes generic behaviour for a sql client 
 */
var shouldBehaveLikeASQLCLient = function() {

    it('should emit data with valid sql', function(done) {
        var sql = "select * from {table} limit 1";
        console.log(secret.EXISTING_TABLE);
        this.client.query(sql, {table: secret.EXISTING_TABLE}, function(err, data){
          assert.equal(1, data.total_rows);
          done();
        });
    });

    it('should emit error with valid invalid sql', function(done) {
        var sql = "select * from {table} limit 1";
        this.client.query(sql, {table: 'ASDASDASDASDASDassaDDS'}, function(error, data){
          assert.ok(typeof error !== undefined);
          assert.ok(typeof error.statusCode !== undefined);
          done();
        });
    });

    it('should be able to do write operations', function(done) {
        var sql = "insert into {table} (name) values ('test')";
        this.client.query(sql, {table: secret.EXISTING_TABLE}, function(){
          done();
        });
    });


};

describe('cartodb_oauth_client', function() {
  before(function(done){
    this.client = new CartoDB({
        user : secret.USER,
        password : secret.password,
        consumer_key : secret.CONSUMER_KEY, 
        consumer_secret : secret.CONSUMER_SECRET});
    this.client.connect();
    console.log('connecting');
    this.client.on('connect', function() {
        done();
    });
  });

  beforeEach(function(done){
    this.client.removeAllListeners('data')
    this.client.removeAllListeners('error')
    done();
  });

  shouldBehaveLikeASQLCLient();

});


module.exports = {
    shouldBehaveLikeASQLCLient: shouldBehaveLikeASQLCLient
};
