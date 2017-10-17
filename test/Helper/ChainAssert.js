
import assert from 'assert'
import ByteEncoder from '../../src/ByteEncoder'
import Chain from '../../src/Chain'

/**
 * Utility class for Chain object assertions.
 */
export default class ChainAssert {
  /**
   * Asserts Chain objects to be equal. Compares the actual string or the hex
   * representation to display useful feedback if assertion fails.
   * @param {mixed} actual
   * @param {Chain} expected
   * @param {string} [message]
   */
  static equal (actual, expected, message = undefined) {
    assert.ok(actual instanceof Chain,
      'Value is expected to be a Chain object.')

    if (actual.needsByteEncoding()) {
      // content is text encoded
      assert.strictEqual(actual.getString(), expected.getString(), message)
    } else {
      // content is byte encoded
      let actualString = ByteEncoder.hexStringFromBytes(actual.getBytes())
      let expectedString = ByteEncoder.hexStringFromBytes(expected.getBytes())
      assert.strictEqual(actualString, expectedString, message)
    }
  }
}
