
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import AtbashEncoder from '../../src/Encoder/Atbash'

/** @test {AtbashEncoder} */
describe('AtbashEncoder', () => EncoderTester.test(AtbashEncoder, [
  {
    settings: { alphabet: 'latin' },
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: 'zyxwvutsrqponmlkjihgfedcba'
  },
  {
    settings: { alphabet: 'hebrew' },
    content: 'אבגדהוזחטיכלמנסעפצקרשת',
    expectedResult: 'תשרקצפעסנמלכיטחזוהדגבא'
  }
]))
