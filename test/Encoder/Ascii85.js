
import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import Ascii85Encoder from '../../src/Encoder/Ascii85'

/** @test {Ascii85Encoder} */
describe('Ascii85Encoder', () => EncoderTester.test(Ascii85Encoder, [
  {
    // empty conversion
    content: '',
    expectedResult: ''
  },
  {
    // string with no padding
    content: `Mupp`,
    expectedResult: `9m(Do`
  },
  {
    // wrapped string
    direction: 'decode',
    content: `ignored <~87cURD]i,"Ebo7~> content`,
    expectedResult: `Hello World`
  },
  {
    // 1 character padding
    content: `Hello`,
    expectedResult: `87cURDZ`
  },
  {
    // 2 character padding
    content: `Hello `,
    expectedResult: `87cURD]f`
  },
  {
    // 3 character padding
    content: `Hello W`,
    expectedResult: `87cURD]i*`
  },
  {
    // wikipedia example
    // string with incomplete last 4-tuple
    content:
      `Man is distinguished, not only by his reason, but by this singular ` +
      `passion from other animals, which is a lust of the mind, that by a ` +
      `perseverance of delight in the continued and indefatigable generation ` +
      `of knowledge, exceeds the short vehemence of any carnal pleasure.`,
    expectedResult:
      `9jqo^BlbD-BleB1DJ+*+F(f,q/0JhKF<GL>Cj@.4Gp$d7F!,L7@<6@)/0JDEF<G%<+EV:2` +
      `F!,O<DJ+*.@<*K0@<6L(Df-\\0Ec5e;DffZ(EZee.Bl.9pF"AGXBPCsi+DGm>@3BB/F*&O` +
      `CAfu2/AKYi(DIb:@FD,*)+C]U=@3BN#EcYf8ATD3s@q?d$AftVqCh[NqF<G:8+EV:.+Cf>` +
      `-FD5W8ARlolDIal(DId<j@<?3r@:F%a+D58'ATD4$Bl@l3De:,-DJs\`8ARoFb/0JMK@qB` +
      `4^F!,R<AKZ&-DfTqBG%G>uD.RTpAKYo'+CT/5+Cei#DII?(E,9)oF*2M7/c`
  }
]))
