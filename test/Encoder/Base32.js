import { describe } from 'mocha'

import Base32Encoder from '../../src/Encoder/Base32'
import EncoderTester from '../Helper/EncoderTester'

/** @test {Base32Encoder} */
describe('Base32Encoder', () => EncoderTester.test(Base32Encoder, [
  {
    settings: { variant: 'base32' },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult:
      'KRUGKIDROVUWG2ZAMJZG653OEBTG66BANJ2W24DTEBXXMZLSEB2GQZJANRQXU6JAMRXWOLQ='
  },
  {
    settings: { variant: 'base32hex' },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult:
      'AHK6A83HELKM6QP0C9P6UTRE41J6UU10D9QMQS3J41NNCPBI41Q6GP90DHGNKU90CHNMEBG='
  },
  {
    settings: { variant: 'z-base-32' },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult:
      'ktwgkedtqiwsg43ycj3g675qrbug66bypj4s4hdurbzzc3m1rb4go3jyptozw6jyctzsqmo'
  },
  {
    settings: { variant: 'crockford-base32' },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult:
      'AHM6A83HENMP6TS0C9S6YXVE41K6YY10D9TPTW3K41QQCSBJ41T6GS90DHGQMY90CHQPEBG'
  },
  {
    direction: 'decode',
    settings: { variant: 'crockford-base32' },
    content:
      'ahm6a83henmp6ts0c9s6yxve41k6yyLod9tp' +
      'tw3k41qqcsbj4lt6gs9Odhgqmy90chqpebg',
    expectedResult:
      'The quick brown fox jumps over the lazy dog.'
  },
  {
    settings: {
      variant: 'custom',
      alphabet: '❶❷❸❹❺❻❼❽❾❿➀➁➂➃➄➅➆➇➈➉➊➋➌➍➎➏➐➑➒➓❊❋',
      padding: '❈'
    },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult:
      '➀➇➊❼➀❾❹➇➄➋➊➌❼➐➏❶➂❿➏❼❊➓➑➄❺❷➉❼❊❊❷❶➃❿➐➌' +
      '➐➒❹➉❺❷➍➍➂➏➁➈❺❷➐❼➆➏❿❶➃➇➆➍➊❊❿❶➂➇➍➌➄➁➆❈'
  },
  // Test vectors for Base32 described in section 10 of RFC 4648
  {
    content: '',
    expectedResult: ''
  },
  {
    content: 'f',
    expectedResult: 'MY======'
  },
  {
    content: 'fo',
    expectedResult: 'MZXQ===='
  },
  {
    content: 'foo',
    expectedResult: 'MZXW6==='
  },
  {
    content: 'foob',
    expectedResult: 'MZXW6YQ='
  },
  {
    content: 'fooba',
    expectedResult: 'MZXW6YTB'
  },
  {
    content: 'foobar',
    expectedResult: 'MZXW6YTBOI======'
  },
  // Test vectors for Base32hex described in section 10 of RFC 4648
  {
    settings: { variant: 'base32hex' },
    content: '',
    expectedResult: ''
  },
  {
    settings: { variant: 'base32hex' },
    content: 'f',
    expectedResult: 'CO======'
  },
  {
    settings: { variant: 'base32hex' },
    content: 'fo',
    expectedResult: 'CPNG===='
  },
  {
    settings: { variant: 'base32hex' },
    content: 'foo',
    expectedResult: 'CPNMU==='
  },
  {
    settings: { variant: 'base32hex' },
    content: 'foob',
    expectedResult: 'CPNMUOG='
  },
  {
    settings: { variant: 'base32hex' },
    content: 'fooba',
    expectedResult: 'CPNMUOJ1'
  },
  {
    settings: { variant: 'base32hex' },
    content: 'foobar',
    expectedResult: 'CPNMUOJ1E8======'
  }
]))
