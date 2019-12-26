var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
    it('is not 1984', () => {
      assert.notEqual(2+2, 'love', 'somebody got to winston');
    })
  });
});