import assert from 'assert'
import { it } from 'mocha'

import Chain from '../../src/Chain.js'
import ChainUtil from './ChainUtil.js'

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

    if (!test.direction || test.direction === 'both') {
      // handle test in both directions
      EncoderTester.test(EncoderInvokable, {
        settings: test.settings,
        direction: 'encode',
        content: test.content,
        expectedResult: test.expectedResult
      })
      EncoderTester.test(EncoderInvokable, {
        settings: test.settings,
        direction: 'decode',
        content: test.expectedResult,
        expectedResult: test.content
      })
      return
    }

    // read direction from test entry
    const isEncoding = test.direction.toLowerCase() === 'encode'

    // wrap content in Chain
    const content =
      test.content instanceof Chain
        ? test.content
        : Chain.wrap(test.content)

    // wrap expected result in Chain
    const expectedResult =
      test.expectedResult instanceof Chain
        ? test.expectedResult
        : Chain.wrap(test.expectedResult)

    // create content and result preview that will be logged
    const contentPreview = ChainUtil.preview(content)
    const expectedResultPreview = ChainUtil.preview(expectedResult)

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
        Promise.resolve(result)
          .then(result => {
            // verify result
            ChainUtil.assertEqual(result, expectedResult)
            // no view should have been created during this process
            assert.strictEqual(encoder.hasView(), false)
          })
          .then(done, done)
      }
    )
  }
}
