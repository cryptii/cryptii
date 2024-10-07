import assert from 'assert'
import { describe, it } from 'mocha'

import TextEncoder from '../src/TextEncoder.js'

const exampleASCII = {
  string: 'Hello World',
  codePoints: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
}

const exampleEmoji = {
  string: '🦊🚀',
  codePoints: [129418, 128640]
}

/** @test {TextEncoder} */
describe('TextEncoder', () => {
  /** @test {TextEncoder.stringFromCodePoints} */
  describe('stringFromCodePoints()', () => {
    it('should return an empty String when empty Array given', () => {
      const string = TextEncoder.stringFromCodePoints([])
      assert.strictEqual(string, '')
    })
    it('should translate ASCII code points to Strings', () => {
      const string = TextEncoder.stringFromCodePoints(exampleASCII.codePoints)
      assert.strictEqual(string, exampleASCII.string)
    })
    it('should translate emoji code points to Strings', () => {
      const string = TextEncoder.stringFromCodePoints(exampleEmoji.codePoints)
      assert.strictEqual(string, exampleEmoji.string)
    })
  })

  /** @test {TextEncoder.codePointsFromString} */
  describe('codePointsFromString()', () => {
    it('should return an empty Array when empty String given', () => {
      const codePoints = TextEncoder.codePointsFromString('')
      assert.deepStrictEqual(codePoints, [])
    })
    it('should translate Strings to ASCII code points', () => {
      const codePoints = TextEncoder.codePointsFromString(exampleASCII.string)
      assert.deepStrictEqual(codePoints, exampleASCII.codePoints)
    })
    it('should translate Strings to emoji code points', () => {
      const codePoints = TextEncoder.codePointsFromString(exampleEmoji.string)
      assert.deepStrictEqual(codePoints, exampleEmoji.codePoints)
    })
  })

  /** @test {TextEncoder.bytesFromCodePoints} */
  describe('bytesFromCodePoints()', () => {
    it('should return an empty Uint8Array when empty Array given', () => {
      const bytes = TextEncoder.bytesFromCodePoints([])
      assert.deepStrictEqual(Array.from(bytes), [])
    })
    it('should UTF-8 encode ASCII characters to the same byte values', () => {
      const bytes = TextEncoder.bytesFromCodePoints(exampleASCII.codePoints, 'utf8')
      assert.deepStrictEqual(bytes, new Uint8Array(exampleASCII.codePoints))
    })
    it('should UTF-8 encode first possible code points of certain byte lengths', () => {
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x1], 'utf8'),
        new Uint8Array([0x01]))
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x80], 'utf8'),
        new Uint8Array([0xC2, 0x80]))
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x800], 'utf8'),
        new Uint8Array([0xE0, 0xA0, 0x80]))
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x10000], 'utf8'),
        new Uint8Array([0xF0, 0x90, 0x80, 0x80]))
    })
    it('should UTF-8 encode last possible code points of certain byte lengths', () => {
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x7E], 'utf8'),
        new Uint8Array([0x7E]))
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x7FE], 'utf8'),
        new Uint8Array([0xDF, 0xBE]))
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0xFFFE], 'utf8'),
        new Uint8Array([0xEF, 0xBF, 0xBE]))
      assert.deepStrictEqual(
        TextEncoder.bytesFromCodePoints([0x10FFFE], 'utf8'),
        new Uint8Array([0xF4, 0x8F, 0xBF, 0xBE]))
    })
  })

  /** @test {TextEncoder.codePointsFromBytes} */
  describe('codePointsFromBytes()', () => {
    it('should return an empty Array when empty Uint8Array given', () => {
      const codePoints = TextEncoder.codePointsFromBytes(new Uint8Array(0))
      assert.deepStrictEqual(codePoints, [])
    })
    it('should UTF-8 decode byte values to the same ASCII characters', () => {
      const bytes = new Uint8Array(exampleASCII.codePoints)
      const codePoints = TextEncoder.codePointsFromBytes(bytes, 'utf8')
      assert.deepStrictEqual(exampleASCII.codePoints, codePoints)
    })
    it('should UTF-8 decode first possible code points of certain byte lengths', () => {
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0x01]), 'utf8'),
        [0x1])
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0xC2, 0x80]), 'utf8'),
        [0x80])
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0xE0, 0xA0, 0x80]), 'utf8'),
        [0x800])
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0xF0, 0x90, 0x80, 0x80]), 'utf8'),
        [0x10000])
    })
    it('should UTF-8 decode last possible code points of certain byte lengths', () => {
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0x7E]), 'utf8'),
        [0x7E])
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0xDF, 0xBE]), 'utf8'),
        [0x7FE])
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0xEF, 0xBF, 0xBE]), 'utf8'),
        [0xFFFE])
      assert.deepStrictEqual(
        TextEncoder.codePointsFromBytes(
          new Uint8Array([0xF4, 0x8F, 0xBF, 0xBE]), 'utf8'),
        [0x10FFFE])
    })
  })
})
