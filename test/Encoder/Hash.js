import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'
import HashEncoder from '../../src/Encoder/Hash'

const bytes = ByteEncoder.bytesFromHexString

/** @test {HashEncoder} */
describe('HashEncoder', () => EncoderTester.test(HashEncoder, [
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: bytes('6363fe744f74ee8f280958ab2f185dde')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: bytes('f30d8f1078f0ee8d8988753e2ec08660')
  },

  // RFC 1321 A.5 Test suite
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: '',
    expectedResult: bytes('d41d8cd98f00b204e9800998ecf8427e')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'a',
    expectedResult: bytes('0cc175b9c0f1b6a831c399e269772661')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'abc',
    expectedResult: bytes('900150983cd24fb0d6963f7d28e17f72')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'message digest',
    expectedResult: bytes('f96b697d7cb7938d525a2f31aaf161d0')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: bytes('c3fcd3d76192e4007dfb496cca67e13b')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    expectedResult: bytes('d174ab98d277d9f5a5611c2c9f419d9f')
  },
  {
    settings: { algorithm: 'md5' },
    direction: 'encode',
    content: '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
    expectedResult: bytes('57edf4a22be3c955ac49da2e2107b67a')
  }
]))
