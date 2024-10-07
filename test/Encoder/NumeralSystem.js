import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import NumeralSystemEncoder from '../../src/Encoder/NumeralSystem'

/** @test {NumeralSystemEncoder} */
describe('NumeralSystemEncoder', () => EncoderTester.test(NumeralSystemEncoder, [
  // Tests for arbitrarily large integers using BigInt
  {
    settings: { from: 'decimal', to: 'binary' },
    content: '16305443177675634559',
    expectedResult:
      '1110001001001000100100100010111000011110101011000011011101111111'
  },
  {
    settings: { from: 'decimal', to: 'octal' },
    content: '16305443177675634559',
    expectedResult: '1611104442703653033577'
  },
  {
    settings: { from: 'decimal', to: 'decimal' },
    content: '16305443177675634559',
    expectedResult: '16305443177675634559'
  },
  {
    settings: { from: 'decimal', to: 'hexadecimal' },
    content: '16305443177675634559',
    expectedResult: 'e248922e1eac377f'
  },

  // Roman numerals tests
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '1',
    expectedResult: 'I'
  },
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '68',
    expectedResult: 'LXVIII'
  },
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '83',
    expectedResult: 'LXXXIII'
  },
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '649',
    expectedResult: 'DCXLIX'
  },
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '798',
    expectedResult: 'DCCXCVIII'
  },
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '891',
    expectedResult: 'DCCCXCI'
  },
  {
    settings: { from: 'decimal', to: 'roman-numerals' },
    content: '3999',
    expectedResult: 'MMMCMXCIX'
  }
]))
