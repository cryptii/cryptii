import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import IntegerEncoder from '../../src/Encoder/Integer'

/** @test {IntegerEncoder} */
describe('IntegerEncoder', () => EncoderTester.test(IntegerEncoder, [
  {
    settings: { format: 'decimal', type: 'U8' },
    content: '🏳️‍🌈',
    expectedResult: '240 159 143 179 239 184 143 226 128 141 240 159 140 136'
  },
  {
    settings: { format: 'binary', type: 'U8' },
    content: '🏳️‍🌈',
    expectedResult:
      '11110000 10011111 10001111 10110011 11101111 10111000 10001111 ' +
      '11100010 10000000 10001101 11110000 10011111 10001100 10001000'
  },
  {
    settings: { format: 'decimal', type: 'I8' },
    content: '🏳️‍🌈',
    expectedResult:
      '-16 -97 -113 -77 -17 -72 -113 -30 -128 -115 -16 -97 -116 -120'
  },
  {
    settings: { format: 'decimal', type: 'U16' },
    content: '🏳️‍🌈',
    expectedResult: '61599 36787 61368 36834 32909 61599 35976'
  },
  {
    settings: { format: 'decimal', type: 'I16' },
    content: '🏳️‍🌈',
    expectedResult: '-3937 -28749 -4168 -28702 -32627 -3937 -29560'
  },
  {
    settings: { format: 'hexadecimal', type: 'U32' },
    content: '//🏳️‍🌈',
    expectedResult: '2f2ff09f 8fb3efb8 8fe2808d f09f8c88'
  },
  {
    settings: { format: 'octal', type: 'U32', byteOrder: 'little-endian' },
    content: '//🏳️‍🌈',
    expectedResult: '23774027457 27073731617 21540161217 21043117760'
  },
  {
    settings: { format: 'decimal', type: 'I32' },
    content: '//🏳️‍🌈',
    expectedResult: '791670943 -1884033096 -1880981363 -257979256'
  }
]))
