import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import PolybiusSquareEncoder from '../../src/Encoder/PolybiusSquare'

/** @test {PolybiusSquareEncoder} */
describe('PolybiusSquareEncoder', () => EncoderTester.test(PolybiusSquareEncoder, [
  {
    content: 'thequickbrownfoxiumpsoverthelazydog',
    expectedResult:
      '4423154145241325124234523321345324453235433451154244231531115554143422'
  },
  // Test case for the i/j limitation
  {
    direction: 'encode',
    content: 'thequickbrownfoxjumpsoverthelazydog',
    expectedResult:
      '4423154145241325124234523321345324453235433451154244231531115554143422'
  },
  // Example from https://de.wikipedia.org/wiki/Polybios-Chiffre
  {
    settings: {
      separator: ' '
    },
    content: 'hallo',
    expectedResult: '23 11 31 31 34'
  },
  // Example from https://en.wikipedia.org/wiki/ADFGVX_cipher
  {
    settings: {
      alphabet: 'btalpdhozkqfvsngicuxmrewy',
      columns: 'adfgx',
      rows: 'adfgx',
      separator: ' '
    },
    content: 'attackatonce',
    expectedResult: 'af ad ad af gf dx af ad df fx gf xf'
  }
]))
