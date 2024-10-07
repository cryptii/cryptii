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
    settings: { alphabet: 'zyxwvutsrqponmlkjihgfedcba', a: 5, b: 8 },
    content: 'affinecipher',
    expectedResult: 'wvvkjqgktfqd'
  },
  // Case strategy tests
  {
    settings: { caseStrategy: 'maintain', a: 5, b: 8 },
    content: 'AffineCipher',
    expectedResult: 'IhhwvcSwfrcp'
  },
  {
    settings: { caseStrategy: 'ignore', a: 5, b: 8 },
    direction: 'encode',
    content: 'AffineCipher',
    expectedResult: 'ihhwvcswfrcp'
  },
  {
    settings: { caseStrategy: 'strict', a: 5, b: 8 },
    content: 'AffineCipher',
    expectedResult: 'AhhwvcCwfrcp'
  }
]))
