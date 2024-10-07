import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import AlphabeticalSubstitutionEncoder from '../../src/Encoder/AlphabeticalSubstitution'

/** @test {AlphabeticalSubstitutionEncoder} */
describe('AlphabeticalSubstitutionEncoder', () => EncoderTester.test(AlphabeticalSubstitutionEncoder, [
  {
    // Atbash latin
    settings: {
      plaintextAlphabet: 'abcdefghijklmnopqrstuvwxyz',
      ciphertextAlphabet: 'zyxwvutsrqponmlkjihgfedcba',
      includeForeignChars: true
    },
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'gsv jfrxp yildm ulc qfnkh levi 13 ozab wlth.'
  },
  {
    // Atbash hebrew
    settings: {
      plaintextAlphabet: 'אבגדהוזחטיכלמנסעפצקרשת',
      ciphertextAlphabet: 'תשרקצפעסנמלכיטחזוהדגבא',
      includeForeignChars: true
    },
    content: 'אבגדהוזחטיכלמנסעפצקרשת',
    expectedResult: 'תשרקצפעסנמלכיטחזוהדגבא'
  },
  {
    // Wikipedia example
    settings: {
      plaintextAlphabet: 'abcdefghijklmnopqrstuvwxyz',
      ciphertextAlphabet: 'zebras',
      // Ciphertext alphabet 'zebras' should be interpreted
      // as 'zebrascdfghijklmnopqtuvwxy'
      includeForeignChars: true
    },
    content: 'flee at once. we are discovered!',
    expectedResult: 'siaa zq lkba. va zoa rfpbluaoar!'
  },
  // Case strategy tests
  {
    settings: { caseStrategy: 'maintain' },
    content: 'Hello World',
    expectedResult: 'Svool Dliow'
  },
  {
    settings: { caseStrategy: 'ignore' },
    direction: 'encode',
    content: 'Hello World',
    expectedResult: 'svool dliow'
  },
  {
    settings: { caseStrategy: 'strict' },
    content: 'Hello World',
    expectedResult: 'Hvool Wliow'
  }
]))
