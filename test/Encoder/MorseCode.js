import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import MorseCodeEncoder from '../../src/Encoder/MorseCode'

/** @test {MorseCodeEncoder} */
describe('MorseCodeEncoder', () => EncoderTester.test(MorseCodeEncoder, [
  {
    content: 'the quick brown fox jumps over 13 lazy dogs',
    expectedResult:
      '- .... . / --.- ..- .. -.-. -.- / -... .-. --- .-- -. / ..-. --- -..- ' +
      '/ .--- ..- -- .--. ... / --- ...- . .-. / .---- ...-- / .-.. .- --.. -' +
      '.-- / -.. --- --. ...'
  },
  {
    settings: {
      shortMark: '/',
      longerMark: '.',
      spaceMark: '-'
    },
    content: 'the quick brown fox jumps over 13 lazy dogs',
    expectedResult:
      '. //// / - ../. //. // ././ ./. - ./// /./ ... /.. ./ - //./ ... .//. ' +
      '- /... //. .. /../ /// - ... ///. / /./ - /.... ///.. - /.// /. ..// .' +
      '/.. - .// ... ../ ///'
  },
  {
    // timing example from https://en.wikipedia.org/wiki/Morse_code
    settings: { representation: 'timing' },
    content: 'morse code',
    expectedResult:
      '===.===...===.===.===...=.===.=...=.=.=...=.......===.=.===.=...===.==' +
      '=.===...===.=.=...='
  },
  {
    settings: {
      representation: 'timing',
      signalOnMark: '.',
      signalOffMark: '='
    },
    content: 'morse code',
    expectedResult:
      '...=...===...=...=...===.=...=.===.=.=.===.=======...=.=...=.===...=..' +
      '.=...===...=.=.===.'
  },
  {
    // test unicode support & numbers
    settings: {
      shortMark: '👇',
      longerMark: '👆'
    },
    content: '02456789?!',
    expectedResult:
      '👆👆👆👆👆 👇👇👆👆👆 👇👇👇👇👆 👇👇👇👇👇 👆👇👇👇👇 👆👆👇👇👇 👆👆👆👇👇 👆👆👆' +
      '👆👇 👇👇👆👆👇👇 👆👇👆👇👆👆'
  },
  {
    // test 'sos', unicode support & multiple mark characters
    settings: {
      shortMark: '👇👍',
      longerMark: '🛫🛬'
    },
    content: 'sos',
    expectedResult: '👇👍👇👍👇👍 🛫🛬🛫🛬🛫🛬 👇👍👇👍👇👍'
  }
]))
