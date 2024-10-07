import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import NihilistCipherEncoder from '../../src/Encoder/NihilistCipher'

/** @test {NihilistCipherEncoder} */
describe('NihilistCipherEncoder', () => EncoderTester.test(NihilistCipherEncoder, [
  {
    // Wikipedia example (https://en.wikipedia.org/wiki/Nihilist_cipher)
    settings: {
      alphabet: 'zebras',
      key: 'russian'
    },
    content: 'dynamitewinterpalace',
    expectedResult:
      '37 106 62 36 67 47 86 26 104 53 62 77 27 55 57 66 55 36 54 27'
  }
]))
