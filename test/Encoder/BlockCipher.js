import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'
import BlockCipherEncoder from '../../src/Encoder/BlockCipher'

const bytes = ByteEncoder.bytesFromHexString

/**
 * AES test vectors extracted from ircmaxell/quality-checker
 * @see  https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/aes-ecb.test-vectors
 * @see  https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/aes-cbc.test-vectors
 * @see  https://github.com/ircmaxell/quality-checker/blob/master/tmp/gh_18/PHP-PasswordLib-master/test/Data/Vectors/aes-ctr.test-vectors
 * @test {BlockCipherEncoder}
 */
describe('BlockCipherEncoder', () => EncoderTester.test(BlockCipherEncoder, [
  // AES-128
  // -ECB
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('3ad77bb40d7a3660a89ecaf32466ef97')
  },
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: bytes('ae2d8a571e03ac9c9eb76fac45af8e51'),
    expectedResult: bytes('f5d3d58503b9699de785895a96fdbaaf')
  },
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: bytes('30c81c46a35ce411e5fbc1191a0a52ef'),
    expectedResult: bytes('43b1cd7f598ece23881b00e3ed030688')
  },
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'ecb',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c')
    },
    content: bytes('f69f2445df4f9b17ad2b417be66c3710'),
    expectedResult: bytes('7b0c785e27e8ad3f8223207104725dd4')
  },

  // -CBC
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'cbc',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c'),
      iv: bytes('000102030405060708090A0B0C0D0E0F')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('7649abac8119b246cee98e9b12e9197d')
  },
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'cbc',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c'),
      iv: bytes('000102030405060708090A0B0C0D0E0F'),
      padding: true
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('7649abac8119b246cee98e9b12e9197d8964e0b149c10b7b682e6e39aaeb731c')
  },

  // -CTR
  {
    settings: {
      algorithm: 'aes-128',
      mode: 'ctr',
      key: bytes('2b7e151628aed2a6abf7158809cf4f3c'),
      iv: bytes('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('874d6191b620e3261bef6864990db6ce')
  },

  // AES-192
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('bd334f1d6e45f25ff712a214571fa5cc')
  },
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: bytes('ae2d8a571e03ac9c9eb76fac45af8e51'),
    expectedResult: bytes('974104846d0ad3ad7734ecb3ecee4eef')
  },
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: bytes('30c81c46a35ce411e5fbc1191a0a52ef'),
    expectedResult: bytes('ef7afd2270e2e60adce0ba2face6444e')
  },
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'ecb',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b')
    },
    content: bytes('f69f2445df4f9b17ad2b417be66c3710'),
    expectedResult: bytes('9a4b41ba738d6c72fb16691603c18e0e')
  },

  // -CBC
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'cbc',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b'),
      iv: bytes('000102030405060708090A0B0C0D0E0F')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('4f021db243bc633d7178183a9fa071e8')
  },
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'cbc',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b'),
      iv: bytes('000102030405060708090A0B0C0D0E0F'),
      padding: true
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('4f021db243bc633d7178183a9fa071e8a647f1643b94812a175a13c8fa2014b2')
  },

  // -CTR
  {
    settings: {
      algorithm: 'aes-192',
      mode: 'ctr',
      key: bytes('8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b'),
      iv: bytes('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('1abc932417521ca24f2b0459fe7e6e0b')
  },

  // AES-256
  // -ECB
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('f3eed1bdb5d2a03c064b5a7e3db181f8')
  },
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: bytes('ae2d8a571e03ac9c9eb76fac45af8e51'),
    expectedResult: bytes('591ccb10d410ed26dc5ba74a31362870')
  },
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: bytes('30c81c46a35ce411e5fbc1191a0a52ef'),
    expectedResult: bytes('b6ed21b99ca6f4f9f153e7b1beafed1d')
  },
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'ecb',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4')
    },
    content: bytes('f69f2445df4f9b17ad2b417be66c3710'),
    expectedResult: bytes('23304b7a39f9f3ff067d8d8f9e24ecc7')
  },

  // -CBC
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'cbc',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'),
      iv: bytes('000102030405060708090A0B0C0D0E0F')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('f58c4c04d6e5f1ba779eabfb5f7bfbd6')
  },
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'cbc',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'),
      iv: bytes('000102030405060708090A0B0C0D0E0F'),
      padding: true
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('f58c4c04d6e5f1ba779eabfb5f7bfbd6485a5c81519cf378fa36d42b8547edc0')
  },

  // -CTR
  {
    settings: {
      algorithm: 'aes-256',
      mode: 'ctr',
      key: bytes('603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'),
      iv: bytes('f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff')
    },
    content: bytes('6bc1bee22e409f96e93d7e117393172a'),
    expectedResult: bytes('601ec313775789a5b7a7f504bbf3d228')
  }

]))
