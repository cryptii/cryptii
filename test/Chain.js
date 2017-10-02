
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
      const a = new Chain(exampleEmoji.codePoints)
      const b = new Chain(exampleEmoji.string)
      const c = new Chain(exampleEmoji.bytes)
      Chain.isEqual(a, b, c)
    })
  })
  /** @test {Chain.constructor} */
  describe('constructor()', () => {
    it('should create an empty UTF-8 Chain if constructed with no args', () => {
      const chain = new Chain()
      assert.deepStrictEqual(chain.getCodePoints(), [])
      assert.strictEqual(chain.getString(), '')
      assert.deepStrictEqual(Array.from(chain.getBytes()), [])
      assert.strictEqual(chain.isEmpty(), true)
      assert.strictEqual(chain.getEncoding(), 'utf8')
    })
    it('should create an emoji Chain containing given a String', () => {
      const chain = new Chain(exampleEmoji.string)
      assert.deepStrictEqual(chain.getCodePoints(), exampleEmoji.codePoints)
      assert.strictEqual(chain.getString(), exampleEmoji.string)
      assert.deepStrictEqual(chain.getBytes(), exampleEmoji.bytes)
    })
    it('should create an emoji Chain containing given code points', () => {
      const chain = new Chain(exampleEmoji.codePoints)
      assert.deepStrictEqual(chain.getCodePoints(), exampleEmoji.codePoints)
      assert.strictEqual(chain.getString(), exampleEmoji.string)
      assert.deepStrictEqual(chain.getBytes(), exampleEmoji.bytes)
    })
    it('should create an emoji Chain containing given bytes', () => {
      const chain = new Chain(exampleEmoji.bytes)
      assert.deepStrictEqual(chain.getCodePoints(), exampleEmoji.codePoints)
      assert.strictEqual(chain.getString(), exampleEmoji.string)
      assert.deepStrictEqual(chain.getBytes(), exampleEmoji.bytes)
    })
  })
  /** @test {Chain.indexOf} */
  describe('indexOf()', () => {
    it('should return the Unicode code point index of first match', () => {
      const chain = new Chain(exampleEmoji.codePoints)
      assert.strictEqual(chain.indexOf('🚀'), 1)
    })
  })
  /** @test {Chain.getLength} */
  describe('getLength()', () => {
    it('should return the amount of Unicode code points', () => {
      const chain = new Chain(exampleEmoji.codePoints)
      assert.strictEqual(chain.getLength(), exampleEmoji.codePoints.length)
    })
  })
  /** @test {Chain.getSize} */
  describe('getSize()', () => {
    it('should return the amount of bytes', () => {
      const chain = new Chain(exampleEmoji.codePoints)
      assert.strictEqual(chain.getSize(), exampleEmoji.bytes.length)
    })
  })
  /** @test {Chain.needsTextEncoding} */
  describe('needsTextEncoding()', () => {
    it('should return false if Chain has been created from string', () => {
      const chain = new Chain(exampleEmoji.string)
      assert.strictEqual(chain.needsTextEncoding(), false)
    })
    it('should return false if Chain has been created from code points', () => {
      const chain = new Chain(exampleEmoji.codePoints)
      assert.strictEqual(chain.needsTextEncoding(), false)
    })
    it('should return true if Chain has been created from bytes', () => {
      const chain = new Chain(exampleEmoji.bytes)
      assert.strictEqual(chain.needsTextEncoding(), true)
    })
  })
  /** @test {Chain.needsByteEncoding} */
  describe('needsByteEncoding()', () => {
    it('should return true if Chain has been created from string', () => {
      const chain = new Chain(exampleEmoji.string)
      assert.strictEqual(chain.needsByteEncoding(), true)
    })
    it('should return true if Chain has been created from code points', () => {
      const chain = new Chain(exampleEmoji.codePoints)
      assert.strictEqual(chain.needsByteEncoding(), true)
    })
    it('should return false if Chain has been created from bytes', () => {
      const chain = new Chain(exampleEmoji.bytes)
      assert.strictEqual(chain.needsByteEncoding(), false)
    })
  })
})
