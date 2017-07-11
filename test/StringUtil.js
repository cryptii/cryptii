
import assert from 'assert'
import { describe, it } from 'mocha'

import StringUtil from '../src/StringUtil'

/** @test {StringUtil} */
describe('StringUtil', () => {
  /** @test {StringUtil.camelCaseToRegular} */
  describe('camelCaseToRegular()', () => {
    it('should translate "helloWorld" to "Hello World"', () => {
      let string = StringUtil.camelCaseToRegular('helloWorld')
      assert.strictEqual('Hello World', string)
    })
    it('should translate "ILoveYOU" to "I Love YOU"', () => {
      let string = StringUtil.camelCaseToRegular('ILoveYOU')
      assert.strictEqual('I Love YOU', string)
    })
  })
})
