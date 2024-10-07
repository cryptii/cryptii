import { describe } from 'mocha'

import BootstringEncoder from '../../src/Encoder/Bootstring'
import EncoderTester from '../Helper/EncoderTester'

/** @test {BootstringEncoder} */
describe('BootstringEncoder', () => EncoderTester.test(BootstringEncoder, [
  // Sample strings from section 7.1 of RFC 3492
  {
    // (A) Arabic (Egyptian)
    content: 'ليهمابتكلموشعربي؟',
    expectedResult: 'egbpdaj6bu4bxfgehfvwxn'
  },
  {
    // (B) Chinese (simplified)
    content: '他们为什么不说中文',
    expectedResult: 'ihqwcrb4cv8a8dqg056pqjye'
  },
  {
    // (C) Chinese (traditional)
    content: '他們爲什麽不說中文',
    expectedResult: 'ihqwctvzc91f659drss3x8bo0yb'
  },
  {
    // (D) Czech
    content: 'pročprostěnemluvíčesky',
    expectedResult: 'proprostnemluvesky-uyb24dma41a'
  },
  {
    // (E) Hebrew
    content: 'למההםפשוטלאמדבריםעברית',
    expectedResult: '4dbcagdahymbxekheh6e0a7fei0b'
  },
  {
    // (F) Hindi (Devanagari)
    content: 'यहलोगहिन्दीक्योंनहींबोलसकतेहैं',
    expectedResult: 'i1baa7eci9glrd9b2ae1bj0hfcgg6iyaf8o0a1dig0cd'
  },
  {
    // (G) Japanese (kanji and hiragana)
    content: 'なぜみんな日本語を話してくれないのか',
    expectedResult: 'n8jok5ay5dzabd5bym9f0cm5685rrjetr6pdxa'
  },
  {
    // (H) Korean (Hangul syllables)
    content: '세계의모든사람들이한국어를이해한다면얼마나좋을까',
    expectedResult:
      '989aomsvi5e83db1d2a355cv1e0vak1dwrv93d5xbh15a0dt30a5jpsd879ccm6fea98c'
  },
  {
    // (I) Russian (Cyrillic)
    content: 'почемужеонинеговорятпорусски',
    expectedResult: 'b1abfaaepdrnnbgefbadotcwatmq2g4l'
  },
  {
    // (J) Spanish
    content: 'porquénopuedensimplementehablarenespañol',
    expectedResult: 'porqunopuedensimplementehablarenespaol-fmd56a'
  },
  {
    // (K) Vietnamese
    content: 'tạisaohọkhôngthểchỉnóitiếngviệt',
    expectedResult: 'tisaohkhngthchnitingvit-kjcr8268qyxafd2f1b9g'
  },
  {
    // (L)
    content: '3年b組金八先生',
    expectedResult: '3b-ww4c5e180e575a65lsy2b'
  },
  {
    // (M)
    content: '安室奈美恵-with-super-monkeys',
    expectedResult: '-with-super-monkeys-pc58ag80a8qai00g7n9n'
  },
  {
    // (N)
    content: 'hello-another-way-それぞれの場所',
    expectedResult: 'hello-another-way--fc4qua05auwb3674vfr0b'
  },
  {
    // (O)
    content: 'ひとつ屋根の下2',
    expectedResult: '2-u9tlzr9756bt3uc0v'
  },
  {
    // (P)
    content: 'majiでkoiする5秒前',
    expectedResult: 'majikoi5-783gue6qz075azm5e'
  },
  {
    // (Q)
    content: 'パフィーdeルンバ',
    expectedResult: 'de-jg4avhby1noc0d'
  },
  {
    // (R)
    content: 'そのスピードで',
    expectedResult: 'd9juau41awczczp'
  },
  {
    // (S) -> $1.00 <-
    content: '-> $1.00 <-',
    expectedResult: '-> $1.00 <--'
  }
]))
