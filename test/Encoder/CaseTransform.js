import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import CaseTransformEncoder from '../../src/Encoder/CaseTransform'

/** @test {CaseTransformEncoder} */
describe('CaseTransformEncoder', () => EncoderTester.test(CaseTransformEncoder, [
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
  }
]))
