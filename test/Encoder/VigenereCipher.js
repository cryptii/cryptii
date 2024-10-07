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
  // Case strategy tests
  {
    settings: { caseStrategy: 'maintain', key: 'GEHEIM' },
    content: 'The Quick Brown Fox Jumps Over The Lazy Dog',
    expectedResult: 'Zll Ucuio Ivwit Jvb Rgstz Sdqx Xoi Tmfc Kso'
  },
  {
    settings: { caseStrategy: 'maintain', key: 'geheim', keyMode: 'autokey' },
    content: 'The Quick Brown Fox Jumps Over The Lazy Dog',
    expectedResult: 'Zll Ucuvr Fhiep Ppo Xqzug Leyd Izs Geqr Ksr'
  },
  {
    settings: { caseStrategy: 'ignore', key: 'geheim' },
    direction: 'encode',
    content: 'Dies ist ein Geheimnis',
    expectedResult: 'jmlw qez ipr oqnipqvuy'
  },
  {
    settings: { caseStrategy: 'strict', key: 'geheim' },
    content: 'Dies ist ein Geheimnis',
    expectedResult: 'Doiz maf kmu Gipqoquma'
  }
]))
