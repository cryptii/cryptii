import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'
import HMACEncoder from '../../src/Encoder/HMAC'

const bytes = ByteEncoder.bytesFromHexString

/** @test {HMACEncoder} */
describe('HMACEncoder', () => EncoderTester.test(HMACEncoder, [
  {
    settings: {
      algorithm: 'md5',
      key: bytes('63727970746969')
    },
    direction: 'encode',
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: bytes('4e14e9c9288d4858af9ff3d228f20689')
  },

  // RFC 4231 4.2 Test vectors
  {
    settings: {
      algorithm: 'sha256',
      key: bytes('0b'.repeat(20))
    },
    direction: 'encode',
    content: 'Hi There',
    expectedResult: bytes(
      'b0344c61d8db38535ca8afceaf0bf12b' +
      '881dc200c9833da726e9376c2e32cff7')
  },
  {
    settings: {
      algorithm: 'sha384',
      key: bytes('0b'.repeat(20))
    },
    direction: 'encode',
    content: 'Hi There',
    expectedResult: bytes(
      'afd03944d84895626b0825f4ab46907f' +
      '15f9dadbe4101ec682aa034c7cebc59c' +
      'faea9ea9076ede7f4af152e8b2fa9cb6')
  },
  {
    settings: {
      algorithm: 'sha512',
      key: bytes('0b'.repeat(20))
    },
    direction: 'encode',
    content: 'Hi There',
    expectedResult: bytes(
      '87aa7cdea5ef619d4ff0b4241a1d6cb0' +
      '2379f4e2ce4ec2787ad0b30545e17cde' +
      'daa833b7d6b8a702038b274eaea3f4e4' +
      'be9d914eeb61f1702e696c203a126854')
  },

  // RFC 4231 4.3 Test vectors
  {
    settings: {
      algorithm: 'sha256',
      key: bytes('4a656665')
    },
    direction: 'encode',
    content: 'what do ya want for nothing?',
    expectedResult: bytes(
      '5bdcc146bf60754e6a042426089575c7' +
      '5a003f089d2739839dec58b964ec3843')
  },
  {
    settings: {
      algorithm: 'sha384',
      key: bytes('4a656665')
    },
    direction: 'encode',
    content: 'what do ya want for nothing?',
    expectedResult: bytes(
      'af45d2e376484031617f78d2b58a6b1b' +
      '9c7ef464f5a01b47e42ec3736322445e' +
      '8e2240ca5e69e2c78b3239ecfab21649')
  },
  {
    settings: {
      algorithm: 'sha512',
      key: bytes('4a656665')
    },
    direction: 'encode',
    content: 'what do ya want for nothing?',
    expectedResult: bytes(
      '164b7a7bfcf819e2e395fbe73b56e0a3' +
      '87bd64222e831fd610270cd7ea250554' +
      '9758bf75c05a994a6d034f65f8f0e6fd' +
      'caeab1a34d4a6b4b636e070a38bce737')
  }
]))
