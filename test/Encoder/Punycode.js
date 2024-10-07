import { describe } from 'mocha'

import PunycodeEncoder from '../../src/Encoder/Punycode'
import EncoderTester from '../Helper/EncoderTester'

/** @test {PunycodeEncoder} */
describe('PunycodeEncoder', () => EncoderTester.test(PunycodeEncoder, [
  {
    content: 'fränzfriederes',
    expectedResult: 'xn--frnzfriederes-cfb'
  },
  {
    content: 'fränzfriederes.com',
    expectedResult: 'xn--frnzfriederes-cfb.com'
  },
  {
    content: 'www.fränzfriederes.com',
    expectedResult: 'www.xn--frnzfriederes-cfb.com'
  },
  {
    content: 'äddi.fränzfriederes.com',
    expectedResult: 'xn--ddi-pla.xn--frnzfriederes-cfb.com'
  }
]))
