
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import SimpleSubstitutionEncoder from '../../src/Encoder/SimpleSubstitution'

/** @test {SimpleSubstitutionEncoder} */
describe('SimpleSubstitutionEncoder', () => EncoderTester.test(SimpleSubstitutionEncoder, [
  {
    // Atbash example
    settings: {
      plaintextAlphabet: 'abcdefghijklmnopqrstuvwxyz',
      ciphertextAlphabet: 'zyxwvutsrqponmlkjihgfedcba',
      caseSensitivity: false,
      includeForeignChars: true
    },
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'gsv jfrxp yildm ulc qfnkh levi 13 ozab wlth.'
  },
  {
    // Wikipedia example
    settings: {
      plaintextAlphabet: 'abcdefghijklmnopqrstuvwxyz',
      ciphertextAlphabet: 'zebras',
      // Ciphertext alphabet 'zebras' should be interpreted
      // as 'zebrascdfghijklmnopqtuvwxy'
      caseSensitivity: false,
      includeForeignChars: true
    },
    content: 'flee at once. we are discovered!',
    expectedResult: 'siaa zq lkba. va zoa rfpbluaoar!'
  }
]))
