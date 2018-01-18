var assert = require('assert');
var PingPong = require('../server/controller/PingPongController.js');
var controller;

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

describe('PingPongControllerTest', function() {
    beforeEach(function() {
        controller = new PingPong();
    });
    it('should be true with an es6 function', function() {
        assert(true);
    })
});