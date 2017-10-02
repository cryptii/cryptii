
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

    const isEncoding =
      test.direction === undefined ||
      test.direction.toLowerCase() === 'encode'

    it(
      `should ${isEncoding ? 'encode' : 'decode'} ` +
      `"${isEncoding ? test.content : test.expectedResult}" ` +
      `${isEncoding ? '=>' : '<='} ` +
      `"${isEncoding ? test.expectedResult : test.content}"`,
      done => {
        // wrap content in Chain
        const content = !(test.content instanceof Chain)
          ? new Chain(test.content)
          : test.content

        // wrap expected result in Chain
        const expectedResult = !(test.expectedResult instanceof Chain)
          ? new Chain(test.expectedResult)
          : test.expectedResult

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

        // resolve result promise if needed
        Promise.resolve(result).then(result => {
          // verify result
          assert.strictEqual(Chain.isEqual(result, expectedResult), true)
          // no view should have been created during this process
          assert.strictEqual(encoder.hasView(), false)
          // finish test
          done()
        })
      }
    )
  }
}
