
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import AffineCipherEncoder from '../../src/Encoder/AffineCipher'

/** @test {AffineCipherEncoder} */
describe('AffineCipherEncoder', () => EncoderTester.test(AffineCipherEncoder, [
  {
    settings: { a: 1, b: 7 },
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: 'hijklmnopqrstuvwxyzabcdefg'
  },
  {
    settings: { a: 5, b: 8 },
    content: 'affinecipher',
    expectedResult: 'ihhwvcswfrcp'
  },
  {
    settings: { caseSensitivity: true, a: 5, b: 8 },
    content: 'AffineCipher',
    expectedResult: 'AhhwvcCwfrcp'
  },
  {
    settings: { alphabet: 'zyxwvutsrqponmlkjihgfedcba', a: 5, b: 8 },
    content: 'affinecipher',
    expectedResult: 'wvvkjqgktfqd'
  }
]))
