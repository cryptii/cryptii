
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import VigenereCipherEncoder from '../../src/Encoder/VigenereCipher'

/** @test {VigenereCipherEncoder} */
describe('VigenereCipherEncoder', () => EncoderTester.test(VigenereCipherEncoder, [
  {
    settings: { key: 'akey' },
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'tri ousgi bbsun psv jeqns yzcr 13 vexy nses.'
  },
  {
    settings: { key: 'akey', variant: 'beaufort-cipher' },
    content: 'the quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'hda igcco ztqcn fqb rqsji wjuj 13 zezc hqsi.'
  },
  {
    settings: { key: 'akey', variant: 'variant-beaufort-cipher' },
    content: 'tri ousgi bbsun psv jeqns yzcr 13 vexy nses.',
    expectedResult: 'the quick brown fox jumps over 13 lazy dogs.'
  },
  {
    settings: { caseSensitivity: false, key: 'AKEY' },
    direction: 'encode',
    content: 'Geheimnis',
    expectedResult: 'golciwrgs'
  },
  {
    settings: { caseSensitivity: false, key: 'AKEY' },
    direction: 'decode',
    content: 'Golciwrgs',
    expectedResult: 'geheimnis'
  }
]))
