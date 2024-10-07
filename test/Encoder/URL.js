import { describe } from 'mocha'

import EncoderTester from '../Helper/EncoderTester'
import URLEncoder from '../../src/Encoder/URL'

/** @test {URLEncoder} */
describe('URLEncoder', () => EncoderTester.test(URLEncoder, [
  {
    // RFC 3986 2.2 reserved characters
    content:
      '!*\'();:@&=+$,/?#[]',
    expectedResult:
      '%21%2a%27%28%29%3b%3a%40%26%3d%2b%24%2c%2f%3f%23%5b%5d'
  },
  {
    // RFC 3986 2.3 unreserved characters
    content:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~',
    expectedResult:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~'
  },
  {
    content: 'https://cryptii.com/url-encode?foo=hello&bar=world',
    expectedResult:
      'https%3a%2f%2fcryptii.com%2furl-encode%3ffoo%3dhello%26bar%3dworld'
  },
  {
    content: 'https://www.google.lu/search?q=hello+world&ie=UTF-8',
    expectedResult:
      'https%3a%2f%2fwww.google.lu%2fsearch%3fq%3dhello%2bworld%26ie%3dUTF-8'
  },
  {
    direction: 'decode',
    content: 'this+is+a+search+query',
    expectedResult: 'this is a search query'
  },
  {
    content: '#pride 🏳️‍🌈',
    expectedResult: '%23pride%20%f0%9f%8f%b3%ef%b8%8f%e2%80%8d%f0%9f%8c%88'
  }
]))
