
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import AffineCipherEncoder from '../../src/Encoder/AffineCipher'

/** @test {AffineCipherEncoder} */
describe('AffineCipherEncoder', () => EncoderTester.test(AffineCipherEncoder, [
  {
    settings: { a: 1, b: 7 },
    direction: 'encode',
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: 'hijklmnopqrstuvwxyzabcdefg'
  },
  {
    settings: { a: 5, b: 8 },
    direction: 'encode',
    content: 'affinecipher',
    expectedResult: 'ihhwvcswfrcp'
  },
  {
    settings: { caseSensitivity: false, a: 5, b: 8 },
    direction: 'encode',
    content: 'AffineCipher',
    expectedResult: 'ihhwvcswfrcp'
  },
  {
    settings: { a: 5, b: 8 },
    direction: 'encode',
    content: 'AffineCipher',
    expectedResult: 'AhhwvcCwfrcp'
  },
  {
    settings: { alphabet: 'zyxwvutsrqponmlkjihgfedcba', a: 5, b: 8 },
    direction: 'encode',
    content: 'affinecipher',
    expectedResult: 'wvvkjqgktfqd'
  },
  {
    settings: { a: 1, b: 7 },
    direction: 'decode',
    content: 'hijklmnopqrstuvwxyzabcdefg',
    expectedResult: 'abcdefghijklmnopqrstuvwxyz'
  },
  {
    settings: { a: 5, b: 8 },
    direction: 'decode',
    content: 'ihhwvcswfrcp',
    expectedResult: 'affinecipher'
  },
  {
    settings: { alphabet: 'zyxwvutsrqponmlkjihgfedcba', a: 5, b: 8 },
    direction: 'decode',
    content: 'wvvkjqgktfqd',
    expectedResult: 'affinecipher'
  }
]))
