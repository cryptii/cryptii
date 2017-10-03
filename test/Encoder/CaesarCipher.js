
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import CaesarCipherEncoder from '../../src/Encoder/CaesarCipher'

/** @test {CaesarCipherEncoder} */
describe('CaesarCipherEncoder', () => EncoderTester.test(CaesarCipherEncoder, [
  {
    // wikipedia example
    settings: { caesarCipherShift: -3 },
    direction: 'encode',
    content: 'the quick brown fox jumps over the lazy dog',
    expectedResult: 'qeb nrfzh yoltk clu grjmp lsbo qeb ixwv ald'
  },
  {
    settings: { caesarCipherShift: 7 },
    direction: 'encode',
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'aol xbpjr iyvdu mve qbtwz vcly 13 shgf kvnz.'
  }
]))
