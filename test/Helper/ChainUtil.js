import assert from 'assert'

import ByteEncoder from '../../src/ByteEncoder.js'
import Chain from '../../src/Chain.js'

const previewLength = 32

/**
 * Utility class for Chain object tests.
 */
export default class ChainUtil {
  /**
   * Asserts Chain objects to be equal. Compares the actual string or the hex
   * representation to display useful feedback if assertion fails.
   * @param {mixed} actual
   * @param {Chain} expected
   * @param {string} [message]
   */
  static assertEqual (actual, expected, message = undefined) {
    assert.ok(actual instanceof Chain,
      'Value is expected to be a Chain object.')

    if (actual.needsByteEncoding()) {
      // content is text encoded
      assert.strictEqual(actual.getString(), expected.getString(), message)
    } else {
      // content is byte encoded
      const actualString = ByteEncoder.hexStringFromBytes(actual.getBytes())
      const expectedString = ByteEncoder.hexStringFromBytes(expected.getBytes())
      assert.strictEqual(actualString, expectedString, message)
    }
  }

  /**
   * Creates string preview of given Chain object.
   * @param {Chain} content
   * @return {string}
   */
  static preview (content) {
    if (!content.needsTextEncoding()) {
      // truncate text to preview length
      return content.truncate(previewLength)
    }

    // create hex byte preview
    const previewBytes = content.getBytes().slice(0, previewLength / 2)
    const preview = ByteEncoder.hexStringFromBytes(previewBytes)
    return content.getBytes().length > previewLength / 2
      ? preview + '…'
      : preview
  }
}
