
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import EnigmaEncoder from '../../src/Encoder/Enigma'

/** @test {EnigmaEncoder} */
describe('EnigmaEncoder', () => EncoderTester.test(EnigmaEncoder, [
  {
    settings: {
      rotor1: 'I',
      rotor2: 'II',
      rotor3: 'III',
      position1: 13,
      position2: 3,
      position3: 11,
      reflector: 'UKW-B',
      includeForeignChars: false
    },
    direction: 'encode',
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'apzmt ckvko hohmv inhkw rnalk jktsh dem'
  },
  {
    // thank you so much, Mike Koss, for testing this edge case
    // on an actual enigma machine (https://youtu.be/unw7St0azMw)
    settings: {
      rotor1: 'I',
      rotor2: 'II',
      rotor3: 'III',
      position1: 13,
      position2: 5,
      position3: 21,
      reflector: 'UKW-B',
      includeForeignChars: false
    },
    direction: 'encode',
    content: 'aaaaa',
    expectedResult: 'gdxtz'
  }
]))
