
import assert from 'assert'
import { describe, it } from 'mocha'

import Chain from '../src/Chain'

const exampleEmoji = {
  string: '🦊🚀',
  codePoints: [129418, 128640],
  bytes: new Uint8Array([240, 159, 166, 138, 240, 159, 154, 128])
}

/** @test {Chain} */
describe('Chain', () => {
  /** @test {Chain.isEqual} */
  describe('isEqual()', () => {
    it('should return true no matter which content representation was used at creation time', () => {
      let a = new Chain(exampleEmoji.codePoints)
      let b = new Chain(exampleEmoji.string)
      let c = new Chain(exampleEmoji.bytes)
      Chain.isEqual(a, b, c)
    })
  })
  /** @test {Chain.constructor} */
  describe('constructor()', () => {
    it('should create an empty Chain if constructed with no args', () => {
      let chain = new Chain()
      assert.deepStrictEqual(chain.getCodePoints(), [])
      assert.strictEqual(chain.getString(), '')
      assert.deepStrictEqual(Array.from(chain.getBytes()), [])
      assert.strictEqual(chain.isEmpty(), true)
    })
    it('should create an emoji Chain containing given a String', () => {
      let chain = new Chain(exampleEmoji.string)
      assert.deepStrictEqual(chain.getCodePoints(), exampleEmoji.codePoints)
      assert.strictEqual(chain.getString(), exampleEmoji.string)
      assert.deepStrictEqual(chain.getBytes(), exampleEmoji.bytes)
    })
    it('should create an emoji Chain containing given code points', () => {
      let chain = new Chain(exampleEmoji.codePoints)
      assert.deepStrictEqual(chain.getCodePoints(), exampleEmoji.codePoints)
      assert.strictEqual(chain.getString(), exampleEmoji.string)
      assert.deepStrictEqual(chain.getBytes(), exampleEmoji.bytes)
    })
    it('should create an emoji Chain containing given bytes', () => {
      let chain = new Chain(exampleEmoji.bytes)
      assert.deepStrictEqual(chain.getCodePoints(), exampleEmoji.codePoints)
      assert.strictEqual(chain.getString(), exampleEmoji.string)
      assert.deepStrictEqual(chain.getBytes(), exampleEmoji.bytes)
    })
  })
})
