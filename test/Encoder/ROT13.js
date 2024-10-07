import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import ROT13Encoder from '../../src/Encoder/ROT13'

/** @test {ROT13Encoder} */
describe('ROT13Encoder', () => EncoderTester.test(ROT13Encoder, [
  {
    settings: { variant: 'rot5' },
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'The quick brown fox jumps over 68 lazy dogs.'
  },
  {
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'Gur dhvpx oebja sbk whzcf bire 13 ynml qbtf.'
  },
  {
    settings: { variant: 'rot18' },
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: 'Gur dhvpx oebja sbk whzcf bire 68 ynml qbtf.'
  },
  {
    settings: { variant: 'rot47' },
    content: 'The quick brown fox jumps over 13 lazy dogs.',
    expectedResult: '%96 BF:4< 3C@H? 7@I ;F>AD @G6C `b =2KJ 5@8D]'
  }
]))
