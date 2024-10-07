import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import RC4Encoder from '../../src/Encoder/RC4'
import EncoderTester from '../Helper/EncoderTester'

const bytes = ByteEncoder.bytesFromHexString

/** @test {RC4Encoder} */
describe('RC4Encoder', () => EncoderTester.test(RC4Encoder, [
  {
    settings: { key: bytes('63727970746969') },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult: bytes(
      '2ac2fecdd8fbb84638e3a4820eb205cc8e29c28b9d5d' +
      '6b2ef974f311964971c90e8b9ca16467ef2dc6fc3520')
  },
  // Test vectors from section 2 of RCF 6229
  // Key length: 40 bits
  {
    settings: { key: bytes('0102030405') },
    content: bytes(
      '00000000000000000000000000000000' +
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      'b2396305f03dc027ccc3524a0a1118a8' +
      '6982944f18fc82d589c403a47a0d0919')
  },
  // Key length: 56 bits
  {
    settings: { key: bytes('01020304050607') },
    content: bytes(
      '00000000000000000000000000000000' +
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      '293f02d47f37c9b633f2af5285feb46b' +
      'e620f1390d19bd84e2e0fd752031afc1')
  },
  // Key length: 64 bits
  {
    settings: { key: bytes('0102030405060708') },
    content: bytes(
      '00000000000000000000000000000000' +
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      '97ab8a1bf0afb96132f2f67258da15a8' +
      '8263efdb45c4a18684ef87e6b19e5b09')
  },
  // Key length: 64 bits, drop: 240
  {
    settings: { key: bytes('0102030405060708'), drop: 240 },
    content: bytes(
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      '9636ebc9841926f4f7d1f362bddf6e18')
  },
  // Key length: 64 bits, drop: 768
  {
    settings: { key: bytes('0102030405060708'), drop: 768 },
    content: bytes(
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      '44173a103b6616c5d5ad1cee40c863d0')
  },
  // Key length: 64 bits, drop: 3072
  {
    settings: { key: bytes('0102030405060708'), drop: 3072 },
    content: bytes(
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      'bc7683205d4f443dc1f29dda3315c87b')
  },
  // Key length: 80 bits
  {
    settings: { key: bytes('0102030405060708090a') },
    content: bytes(
      '00000000000000000000000000000000' +
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      'ede3b04643e586cc907dc21851709902' +
      '03516ba78f413beb223aa5d4d2df6711')
  },
  // Key length: 128 bits
  {
    settings: { key: bytes('0102030405060708090a0b0c0d0e0f10') },
    content: bytes(
      '00000000000000000000000000000000' +
      '00000000000000000000000000000000'),
    expectedResult: bytes(
      '9ac7cc9a609d1ef7b2932899cde41b97' +
      '5248c4959014126a6e8a84f11d1a9e1c')
  }
]))
