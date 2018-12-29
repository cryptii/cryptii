
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import CaesarCipherEncoder from '../../src/Encoder/CaesarCipher'

/** @test {CaesarCipherEncoder} */
describe('CaesarCipherEncoder', () => EncoderTester.test(CaesarCipherEncoder, [
  {
    // wikipedia example
    settings: { shift: -3 },
    content: 'the quick brown fox jumps over the lazy dog',
    expectedResult: 'qeb nrfzh yoltk clu grjmp lsbo qeb ixwv ald'
  },
  {
    settings: { shift: 7 },
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'aol xbpjr iyvdu mve qbtwz vcly 13 shgf kvnz.'
  }
]))
