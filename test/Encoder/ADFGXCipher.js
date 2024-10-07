import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import ADFGXCipherEncoder from '../../src/Encoder/ADFGXCipher'

/** @test {ADFGXCipherEncoder} */
describe('ADFGXCipherEncoder', () => EncoderTester.test(ADFGXCipherEncoder, [
  {
    // ADFGX Wikipedia example
    // https://en.wikipedia.org/wiki/ADFGVX_cipher
    settings: {
      alphabet: 'btalpdhozkqfvsngicuxmrewy',
      key: 'cargo'
    },
    content: 'attackatonce',
    expectedResult: 'faxdf adddg dgfff afaxa fafx'
  },
  {
    // ADFGX Wikipedia DE example "Der Funkspruch des Sieges"
    // https://de.wikipedia.org/wiki/ADFGX
    settings: {
      alphabet: 'wikpeda',
      key: 'beobachtungsliste'
    },
    content:
      'munitionierungbeschleunigenpunktsoweitnichteingesehenauchbeitag',
    expectedResult:
      'gxgga dddgd xxafa ddfaa xafdf fxfdg dxgag gaaxf agadf aaadg ' +
      'faxxa dadff fddad fgaxg xafxg xfxda fagfx xfaxg fdxff dfagx ' +
      'xgxxa dgxgf xdffd gaxxf fffgd x'
  },
  {
    // ADFGVX Wikipedia example
    // https://en.wikipedia.org/wiki/ADFGVX_cipher
    settings: {
      variant: 'adfgvx',
      alphabet: 'na1c3h8tb2ome5wrpd4f6g7i9j0klqsuvxyz',
      key: 'privacy'
    },
    content: 'attackat1200am',
    expectedResult: 'dgddd agddg afadd fdadv dvfaa dvx'
  }
]))
