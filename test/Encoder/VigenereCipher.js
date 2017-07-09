
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import VigenereCipherEncoder from '../../src/Encoder/VigenereCipher'

/** @test {VigenereCipherEncoder} */
describe('VigenereCipherEncoder', () => EncoderTester.test(VigenereCipherEncoder, [
  {
    settings: { caseSensitivity: true, key: 'akey' },
    direction: 'encode',
    content: 'geheimnis',
    expectedResult: 'golciwrgs'
  },
  {
    settings: { caseSensitivity: false, key: 'AKEY' },
    direction: 'encode',
    content: 'Geheimnis',
    expectedResult: 'golciwrgs'
  },
  {
    settings: { caseSensitivity: true, key: 'akey' },
    direction: 'decode',
    content: 'golciwrgs',
    expectedResult: 'geheimnis'
  },
  {
    settings: { caseSensitivity: false, key: 'AKEY' },
    direction: 'decode',
    content: 'Golciwrgs',
    expectedResult: 'geheimnis'
  }
]))
