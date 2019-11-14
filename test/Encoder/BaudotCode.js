
import { describe } from 'mocha'

import BaudotCodeEncoder from '../../src/Encoder/BaudotCode'
import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'

const bytes = ByteEncoder.bytesFromHexString

/** @test {BaudotCodeEncoder} */
describe('BaudotCodeEncoder', () => EncoderTester.test(BaudotCodeEncoder, [
  {
    direction: 'encode',
    settings: { variant: 'ita1' },
    content: 'THE QUICK 123 BROWN FOX 456 JUMPS OVER 789 THE LAZY DOG.',
    expectedResult: bytes(
      'aac50e94cdcc10111210670f6f41c7941053a610' +
      '4975fa40f717208531b08556286c33241e752280'
    )
  },
  {
    direction: 'encode',
    settings: { variant: 'ita2' },
    content: 'THE QUICK 123 BROWN FOX 456 JUMPS OVER 789 THE LAZY DOG.',
    expectedResult: bytes(
      '85024b9cce79377987e4cab13611b8e936a857e4' +
      '59f962931e0a89b39b1f2428124871a9138d6f80'
    )
  }
]))
