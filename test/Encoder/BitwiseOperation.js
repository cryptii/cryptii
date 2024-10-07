import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'
import BitwiseOperationEncoder from '../../src/Encoder/BitwiseOperation'

const bytes = ByteEncoder.bytesFromHexString

/** @test {BitwiseOperationEncoder} */
describe('BitwiseOperationEncoder', () => EncoderTester.test(BitwiseOperationEncoder, [
  {
    settings: { operation: 'NOT' },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('fab979adf8e8a969c94df9d8d908891df999087d')
  },
  {
    direction: 'encode',
    settings: { operation: 'AND', operand: bytes('0ff0') },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('054006500710069006b0062006f006e006600780')
  },
  {
    direction: 'encode',
    settings: { operation: 'OR', operand: bytes('0ff0') },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('0ff68ff20ff75ff63ff20ff72ff77ff20ff6fff2')
  },
  {
    direction: 'encode',
    settings: { operation: 'XOR', operand: bytes('0ff0') },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('0ab689a208e75966394209d7290779120996f872')
  },
  {
    direction: 'encode',
    settings: { operation: 'NAND', operand: bytes('0ff0') },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('fabff9aff8eff96ff94ff9dff90ff91ff99ff87f')
  },
  {
    direction: 'encode',
    settings: { operation: 'NOR', operand: bytes('0ff0') },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('f009700df008a009c00df008d008800df009000d')
  },
  {
    direction: 'encode',
    settings: { operation: 'NXOR', operand: bytes('0ff0') },
    content: bytes('054686520717569636b2062726f776e20666f782'),
    expectedResult: bytes('f549765df718a699c6bdf628d6f886edf669078d')
  }
]))
