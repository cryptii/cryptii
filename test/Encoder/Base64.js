import { describe } from 'mocha'

import Base64Encoder from '../../src/Encoder/Base64'
import EncoderTester from '../Helper/EncoderTester'

/** @test {Base64Encoder} */
describe('Base64Encoder', () => EncoderTester.test(Base64Encoder, [
  // Test vectors for Base64 defined in section 10 of RFC 4648
  {
    settings: { variant: 'base64' },
    content: '',
    expectedResult: ''
  },
  {
    settings: { variant: 'base64' },
    content: 'f',
    expectedResult: 'Zg=='
  },
  {
    settings: { variant: 'base64' },
    content: 'fo',
    expectedResult: 'Zm8='
  },
  {
    settings: { variant: 'base64' },
    content: 'foo',
    expectedResult: 'Zm9v'
  },
  {
    settings: { variant: 'base64' },
    content: 'foob',
    expectedResult: 'Zm9vYg=='
  },
  {
    settings: { variant: 'base64' },
    content: 'fooba',
    expectedResult: 'Zm9vYmE='
  },
  {
    settings: { variant: 'base64' },
    content: 'foobar',
    expectedResult: 'Zm9vYmFy'
  },
  // Test vectors for 'Base64url'
  {
    settings: { variant: 'base64' },
    content: '🌈🏳️‍🌈🌈',
    expectedResult: '8J+MiPCfj7PvuI/igI3wn4yI8J+MiA=='
  },
  {
    settings: { variant: 'base64url' },
    content: '🌈🏳️‍🌈🌈',
    expectedResult: '8J-MiPCfj7PvuI_igI3wn4yI8J-MiA'
  },
  // Test vector for limited line length variants
  {
    settings: { variant: 'rfc2045' },
    content:
      'This document specifies an Internet standards track protocol for the ' +
      'Internet community, and requests discussion and suggestions for ' +
      'improvements.',
    expectedResult:
      'VGhpcyBkb2N1bWVudCBzcGVjaWZpZXMgYW4gSW50ZXJuZXQgc3RhbmRhcmRzIHRyYWNrIHByb3Rv\r\n' +
      'Y29sIGZvciB0aGUgSW50ZXJuZXQgY29tbXVuaXR5LCBhbmQgcmVxdWVzdHMgZGlzY3Vzc2lvbiBh\r\n' +
      'bmQgc3VnZ2VzdGlvbnMgZm9yIGltcHJvdmVtZW50cy4='
  },
  {
    settings: { variant: 'rfc1421' },
    content:
      'This document specifies an Internet standards track protocol for the ' +
      'Internet community, and requests discussion and suggestions for ' +
      'improvements.',
    expectedResult:
      'VGhpcyBkb2N1bWVudCBzcGVjaWZpZXMgYW4gSW50ZXJuZXQgc3RhbmRhcmRzIHRy\r\n' +
      'YWNrIHByb3RvY29sIGZvciB0aGUgSW50ZXJuZXQgY29tbXVuaXR5LCBhbmQgcmVx\r\n' +
      'dWVzdHMgZGlzY3Vzc2lvbiBhbmQgc3VnZ2VzdGlvbnMgZm9yIGltcHJvdmVtZW50\r\n' +
      'cy4='
  }
]))
