import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import TrifidCipherEncoder from '../../src/Encoder/TrifidCipher'

/** @test {TrifidCipherEncoder} */
describe('TrifidCipherEncoder', () => EncoderTester.test(TrifidCipherEncoder, [
  {
    // Wikipedia example
    // https://en.wikipedia.org/wiki/Trifid_cipher
    settings: {
      key: 'felixmardstbcghjknopquvwyz+',
      groupSize: 5
    },
    // aide-toi, le ciel t'aidera
    content: 'aidetoilecieltaidera',
    expectedResult: 'fmjfvoissuftfpufeqqc'
  },
  {
    // Test vector with a short last group
    settings: {
      key: 'felixmardstbcghjknopquvwyz+',
      groupSize: 5
    },
    content: 'aidetoilecieltaide',
    expectedResult: 'fmjfvoissuftfpufjr'
  }
]))
