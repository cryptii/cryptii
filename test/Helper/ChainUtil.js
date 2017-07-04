
import assert from 'assert'

/**
 * Utility class for common test tasks related to Chain objects.
 */
export default class ChainUtil {
  /**
   * Tests for Chain equality between the actual and expected parameters.
   * @param {Chain} actual
   * @param {Chain} expected
   * @param {string} [message]
   */
  static assertEqual (actual, expected, message = undefined) {
    // assert chain content equality without triggering
    // a byte encoding which may fail
    if (actual._bytes !== null && expected._bytes !== null) {
      assert.deepStrictEqual(actual.getBytes(), expected.getBytes(), message)
    } else {
      assert.strictEqual(actual.getString(), expected.getString(), message)
    }
  }
}
