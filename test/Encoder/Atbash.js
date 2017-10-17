
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import AtbashEncoder from '../../src/Encoder/Atbash'

/** @test {AtbashEncoder} */
describe('AtbashEncoder', () => EncoderTester.test(AtbashEncoder, [
  {
    settings: { atbashAlphabet: 'latin' },
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: 'zyxwvutsrqponmlkjihgfedcba'
  },
  {
    settings: { atbashAlphabet: 'hebrew' },
    content: 'אבגדהוזחטיכלמנסעפצקרשת',
    expectedResult: 'תשרקצפעסנמלכיטחזוהדגבא'
  }
]))
