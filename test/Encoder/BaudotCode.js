import { describe } from 'mocha'

import BaudotCodeEncoder from '../../src/Encoder/BaudotCode'
import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'

const bytes = ByteEncoder.bytesFromBinaryString

/** @test {BaudotCodeEncoder} */
describe('BaudotCodeEncoder', () => EncoderTester.test(BaudotCodeEncoder, [
  {
    settings: { variant: 'ita1' },
    content: 'THE QUICK 123 BROWN FOX 456 JUMPS OVER 789 THE LAZY DOG.',
    expectedResult: bytes(
      '10101 01011 00010 10000 11101 00101 00110 01101 11001 10000 01000 ' +
      '00001 00010 00100 10000 10000 01100 11100 00111 10110 11110 10000 ' +
      '01110 00111 10010 10000 01000 00101 00111 01001 10000 10000 01001 ' +
      '00101 11010 11111 10100 10000 00111 10111 00010 11100 10000 01000 ' +
      '01010 01100 01101 10000 10000 10101 01011 00010 10000 11011 00001 ' +
      '10011 00100 10000 01111 00111 01010 01000 10100'
    )
  },
  {
    settings: { variant: 'ita2' },
    content: 'THE QUICK 123 BROWN FOX 456 JUMPS OVER 789 THE LAZY DOG.',
    expectedResult: bytes(
      '10000 10100 00001 00100 10111 00111 00110 01110 01111 00100 11011 ' +
      '10111 10011 00001 11111 00100 11001 01010 11000 10011 01100 00100 ' +
      '01101 11000 11101 00100 11011 01010 10000 10101 11111 00100 01011 ' +
      '00111 11100 10110 00101 00100 11000 11110 00001 01010 00100 11011 ' +
      '00111 00110 11000 11111 00100 10000 10100 00001 00100 10010 00011 ' +
      '10001 10101 00100 01001 11000 11010 11011 11100'
    )
  }
]))
