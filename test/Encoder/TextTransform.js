
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import TextTransformEncoder from '../../src/Encoder/TextTransform'

/** @test {TextTransformEncoder} */
describe('TextTransformEncoder', () => EncoderTester.test(TextTransformEncoder, [
  {
    settings: { case: 'lower' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: 'hello 👋 world'
  },
  {
    settings: { case: 'upper' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: 'HELLO 👋 WORLD'
  },
  {
    settings: { case: 'capitalize' },
    direction: 'encode',
    content: 'HElLo 👋 wORLd',
    expectedResult: 'Hello 👋 World'
  },
  {
    settings: { case: 'alternating' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: 'hElLo 👋 wOrLd'
  },
  {
    settings: { case: 'inverse' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: 'hELLO 👋 wORLD'
  },
  {
    settings: { arrangement: 'reverse' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: 'dlroW 👋 olleH'
  },
  {
    settings: { case: 'alternating', arrangement: 'reverse' },
    direction: 'encode',
    content: 'Hello 👋 World',
    expectedResult: 'dLrOw 👋 oLlEh'
  }
]))
