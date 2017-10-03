
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import AtbashEncoder from '../../src/Encoder/Atbash'

/** @test {AtbashEncoder} */
describe('AtbashEncoder', () => EncoderTester.test(AtbashEncoder, [
  {
    settings: { atbashAlphabet: 'latin' },
    direction: 'encode',
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: 'zyxwvutsrqponmlkjihgfedcba'
  },
  {
    settings: { atbashAlphabet: 'latin' },
    direction: 'decode',
    content: 'abcdefghijklmnopqrstuvwxyz',
    expectedResult: 'zyxwvutsrqponmlkjihgfedcba'
  },
  {
    settings: { atbashAlphabet: 'hebrew' },
    direction: 'encode',
    content: 'אבגדהוזחטיכלמנסעפצקרשת',
    expectedResult: 'תשרקצפעסנמלכיטחזוהדגבא'
  },
  {
    settings: { atbashAlphabet: 'hebrew' },
    direction: 'decode',
    content: 'אבגדהוזחטיכלמנסעפצקרשת',
    expectedResult: 'תשרקצפעסנמלכיטחזוהדגבא'
  }
]))
