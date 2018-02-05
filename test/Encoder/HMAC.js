
import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'
import HMACEncoder from '../../src/Encoder/HMAC'

const bytes = ByteEncoder.bytesFromHexString

/** @test {HMACEncoder} */
describe('HMACEncoder', () => EncoderTester.test(HMACEncoder, [
  {
    settings: {
      algorithm: 'MD5',
      key: bytes('63727970746969')
    },
    direction: 'encode',
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: bytes('4e14e9c9288d4858af9ff3d228f20689')
  }
]))
