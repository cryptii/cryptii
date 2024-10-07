import { describe } from 'mocha'

import ByteEncoder from '../../src/ByteEncoder'
import EncoderTester from '../Helper/EncoderTester'
import ReverseEncoder from '../../src/Encoder/Reverse'

const bytes = ByteEncoder.bytesFromHexString

/** @test {ReverseEncoder} */
describe('ReverseEncoder', () => EncoderTester.test(ReverseEncoder, [
  {
    settings: { type: 'byte' },
    content: '😀😃😄😁😆',
    expectedResult: bytes('86989ff081989ff084989ff083989ff080989ff0')
  },
  {
    settings: { type: 'character' },
    content: 'The quick brown fox jumps over the lazy dog.',
    expectedResult: '.god yzal eht revo spmuj xof nworb kciuq ehT'
  },
  {
    settings: { type: 'character' },
    content: '😀😃😄😁😆',
    expectedResult: '😆😁😄😃😀'
  },
  {
    settings: { type: 'line' },
    content: 'The\nquick\nbrown\nfox\njumps\nover\nthe\nlazy\ndog',
    expectedResult: 'dog\nlazy\nthe\nover\njumps\nfox\nbrown\nquick\nThe'
  }
]))
