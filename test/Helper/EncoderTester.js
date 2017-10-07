
import assert from 'assert'
import { it } from 'mocha'

import Chain from '../../src/Chain'

/**
 * Utility class for testing Encoder objects.
 */
export default class EncoderTester {
  /**
   * Runs tests on encoder invokable.
   * @param {class} EncoderInvokable
   * @param {Object|Object[]}
   */
  static test (EncoderInvokable, test) {
    if (Array.isArray(test)) {
      // handle multiple tests
      return test.forEach(test => EncoderTester.test(EncoderInvokable, test))
    }

    // read direction from test entry
    const isEncoding =
      test.direction === undefined ||
      test.direction.toLowerCase() === 'encode'

    // wrap content in Chain
    const content =
      test.content instanceof Chain
      ? test.content
      : Chain.wrap(test.content)

    // wrap expected result in Chain
    const expectedResult =
      (test.expectedResult === null || test.expectedResult instanceof Chain)
      ? test.expectedResult
      : Chain.wrap(test.expectedResult)

    // create content and result preview that will be logged
    const contentPreview = content.truncate(28)
    const expectedResultPreview =
      expectedResult ? expectedResult.truncate(28) : null

    it(
      `should ${isEncoding ? 'encode' : 'decode'} ` +
      `"${isEncoding ? contentPreview : expectedResultPreview}" ` +
      `${isEncoding ? '=>' : '<='} ` +
      `"${isEncoding ? expectedResultPreview : contentPreview}"`,
      done => {
        // create encoder brick instance
        const encoder = new EncoderInvokable()

        // apply settings, if any
        if (test.settings) {
          encoder.setSettingValues(test.settings)
        }

        // trigger encoder encode or decode
        const result = isEncoding
          ? encoder.encode(content)
          : encoder.decode(content)

        // resolve promise
        result
          .then(result => {
            // verify result
            assert.strictEqual(Chain.isEqual(result, expectedResult), true)
            // no view should have been created during this process
            assert.strictEqual(encoder.hasView(), false)
          })
          .catch(reason => {
            // verify if translation should fail
            assert.strictEqual(expectedResult, null)
          })
          .then(done, done)
      }
    )
  }
}
