
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
    settings: { key: 'secretkey', keyMode: 'autokey' },
    content: 'the quick brown fox jumps over the lazy dog',
    expectedResult: 'llg hybmo zkvad zwz tvddo baso cbq asnt hfz'
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
    settings: { variant: 'trithemius-cipher' },
    content: 'the quick brown fox jumps over the lazy dog',
    expectedResult: 'tig tynir jayhz scm zleim jrbp shf nddd jvo'
  },
  {
    settings: { key: 'AKEY', caseSensitivity: false },
    direction: 'encode',
    content: 'Geheimnis',
    expectedResult: 'golciwrgs'
  },
  {
    settings: { key: 'AKEY', caseSensitivity: false },
    direction: 'decode',
    content: 'Golciwrgs',
    expectedResult: 'geheimnis'
  }
]))
