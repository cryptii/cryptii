
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import TextTransformEncoder from '../../src/Encoder/TextTransform'

/** @test {TextTransformEncoder} */
describe('TextTransformEncoder', () => EncoderTester.test(TextTransformEncoder, [
  {
    settings: { case: 'lower' },
    content: 'Hello 👋 World',
    expectedResult: 'hello 👋 world'
  },
  {
    settings: { case: 'upper' },
    content: 'Hello 👋 World',
    expectedResult: 'HELLO 👋 WORLD'
  },
  {
    settings: { case: 'capitalize' },
    content: 'HElLo 👋 wORLd',
    expectedResult: 'Hello 👋 World'
  },
  {
    settings: { case: 'alternating' },
    content: 'Hello 👋 World',
    expectedResult: 'hElLo 👋 wOrLd'
  },
  {
    settings: { case: 'inverse' },
    content: 'Hello 👋 World',
    expectedResult: 'hELLO 👋 wORLD'
  },
  {
    settings: { arrangement: 'reverse' },
    content: 'Hello 👋 World',
    expectedResult: 'dlroW 👋 olleH'
  },
  {
    settings: { case: 'alternating', arrangement: 'reverse' },
    content: 'Hello 👋 World',
    expectedResult: 'dLrOw 👋 oLlEh'
  }
]))
