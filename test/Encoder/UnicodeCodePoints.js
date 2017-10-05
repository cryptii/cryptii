
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import UnicodeCodePointsEncoder from '../../src/Encoder/UnicodeCodePoints'

/** @test {UnicodeCodePointsEncoder} */
describe('UnicodeCodePointsEncoder', () => EncoderTester.test(UnicodeCodePointsEncoder, [
  {
    settings: { format: 'unicode' },
    content: 'Hello👋',
    expectedResult: 'U+48 U+65 U+6C U+6C U+6F U+1F44B'
  },
  {
    settings: { format: 'unicode' },
    direction: 'decode',
    content: 'U+48 U+65 U+6C U+6C U+6F U+1F44B',
    expectedResult: 'Hello👋'
  },
  {
    settings: { format: 'decimal' },
    content: 'Hello👋',
    expectedResult: '72 101 108 108 111 128075'
  },
  {
    settings: { format: 'decimal' },
    direction: 'decode',
    content: '72 101 108 108 111 128075',
    expectedResult: 'Hello👋'
  },
  {
    settings: { format: 'hexadecimal' },
    content: 'Hello👋',
    expectedResult: '48 65 6c 6c 6f 1f44b'
  },
  {
    settings: { format: 'hexadecimal' },
    direction: 'decode',
    content: '48 65 6c 6c 6f 1f44b',
    expectedResult: 'Hello👋'
  },
  {
    settings: { format: 'binary' },
    content: 'Hello👋',
    expectedResult: '1001000 1100101 1101100 1101100 1101111 11111010001001011'
  },
  {
    settings: { format: 'binary' },
    direction: 'decode',
    content: '1001000 1100101 1101100 1101100 1101111 11111010001001011',
    expectedResult: 'Hello👋'
  },
  {
    settings: { format: 'octal' },
    content: 'Hello👋',
    expectedResult: '110 145 154 154 157 372113'
  },
  {
    settings: { format: 'octal' },
    direction: 'decode',
    content: '110 145 154 154 157 372113',
    expectedResult: 'Hello👋'
  },
  {
    settings: { format: 'ncr-decimal' },
    content: 'Hello👋',
    expectedResult: '&#72; &#101; &#108; &#108; &#111; &#128075;'
  },
  {
    settings: { format: 'ncr-decimal' },
    direction: 'decode',
    content: '&#72; &#101; &#108; &#108; &#111; &#128075;',
    expectedResult: 'Hello👋'
  },
  {
    settings: { format: 'ncr-hexadecimal' },
    content: 'Hello👋',
    expectedResult: '&#x48; &#x65; &#x6c; &#x6c; &#x6f; &#x1f44b;'
  },
  {
    settings: { format: 'ncr-hexadecimal' },
    direction: 'decode',
    content: '&#x48; &#x65; &#x6c; &#x6c; &#x6f; &#x1f44b;',
    expectedResult: 'Hello👋'
  }
]))
