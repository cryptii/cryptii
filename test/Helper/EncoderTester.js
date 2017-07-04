
import { it } from 'mocha'

import Chain from '../../src/Chain'
import ChainUtil from '../Helper/ChainUtil'

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

        // create instance
        const encoder = new EncoderInvokable()

        // apply settings, if any
        if (test.settings) {
          encoder.setSettingValues(test.settings)
        }

        // create result
        const result = isEncoding
          ? encoder.encode(content)
          : encoder.decode(content)

        if (result instanceof Promise) {
          // resolve promise
          result.then(result => {
            // verify result
            ChainUtil.assertEqual(result, expectedResult)
            done()
          })
        } else {
          // verify result
          ChainUtil.assertEqual(result, expectedResult)
          done()
        }
      })
  }
}
