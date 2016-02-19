var CartoDB = require('../../');
var assert = require('assert');

var dummyCredentials = {user: 'someuser', api_key: 'somelongstring'};

beforeEach(function(){
  this.dummySQL = new CartoDB.SQL(dummyCredentials);
});

describe('SQL', function() {
  it('should be true', function() {
      assert.strictEqual(true, false);
  });
});
