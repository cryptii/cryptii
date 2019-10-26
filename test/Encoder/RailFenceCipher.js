import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import RailFenceCipherEncoder from '../../src/Encoder/RailFenceCipher'

/** @test {RailFenceCipherEncoder} */
describe('RailFenceCipherEncoder', () => EncoderTester.test(RailFenceCipherEncoder, [
  {
    // Wikipedia example
    settings: { key: 3 },
    content: 'WEAREDISCOVEREDFLEEATONCE',
    expectedResult: 'WECRLTEERDSOEEFEAOCAIVDEN'
  },
  {
    settings: { key: 25 },
    content: 'WEAREDISCOVEREDFLEEATONCE',
    expectedResult: 'WEAREDISCOVEREDFLEEATONCE'
  },
  {
    settings: { key: 2 },
    content: 'WEAREDISCOVEREDFLEEATONCE',
    expectedResult: 'WAEICVRDLETNEERDSOEEFEAOC'
  },
  {
    settings: { key: 7, offset: 3 },
    content: 'WEAREDISCOVEREDFLEEATONCE',
    expectedResult: 'OOCVTNSEACWIREEEDEEAEDLRF'
  }
]))
