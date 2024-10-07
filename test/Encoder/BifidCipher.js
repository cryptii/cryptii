import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import BifidCipherEncoder from '../../src/Encoder/BifidCipher'

/** @test {BifidCipherEncoder} */
describe('BifidCipherEncoder', () => EncoderTester.test(BifidCipherEncoder, [
  {
    settings: { key: 'bgwkzqpndsioaxefclumthyvr' },
    content: 'thequickbrownfoxiumpsoverthelazydog',
    expectedResult: 'rolfzidaxcnyrylznbskgfhagfmsdrgyexp'
  },
  {
    // Encode content featuring a J char and foreign chars
    settings: { key: 'bgwkzqpndsioaxefclumthyvr' },
    direction: 'encode',
    content: 'The quick brown fox jumps over 7 lazy dogs.',
    expectedResult: 'rolfzidaxcnyvihiqskgfhagfmsdraycs'
  },
  {
    settings: { key: 'crypti' },
    content: 'thequickbrownfoxiumpsoverthelazydog',
    expectedResult: 'ydvyisosemqvcggudllmcobgymcsgvwzekg'
  }
]))
