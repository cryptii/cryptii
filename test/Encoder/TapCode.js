import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import TapCodeEncoder from '../../src/Encoder/TapCode'

/** @test {TapCodeEncoder} */
describe('TapCodeEncoder', () => EncoderTester.test(TapCodeEncoder, [
  {
    content: 'thequiccbrownfoxjumpsoverthelazydog',
    expectedResult:
      '.... ....  .. ...  . .....  .... .  .... .....  .. ....  . ...  ' +
      '. ...  . ..  .... ..  ... ....  ..... ..  ... ...  .. .  ... ....  ' +
      '..... ...  .. .....  .... .....  ... ..  ... .....  .... ...  ' +
      '... ....  ..... .  . .....  .... ..  .... ....  .. ...  . .....  ' +
      '... .  . .  ..... .....  ..... ....  . ....  ... ....  .. ..'
  },
  {
    // Wikipedia example
    content: 'water',
    expectedResult: '..... ..  . .  .... ....  . .....  .... ..'
  }
]))
