
import TextEncodingError from './Error/TextEncoding'

/**
 * Utility class providing static methods for string, Unicode code point
 * and byte translation.
 */
export default class TextEncoder {
  /**
   * Validates a single Unicode code point.
   * @return {boolean} True, if code point is valid
   */
  static validateCodePoint (codePoint) {
    return (
      !isFinite(codePoint) ||
      codePoint < 0 ||
      codePoint > 0x10FFFF ||
      Math.floor(codePoint) !== codePoint
    )
  }

  /**
   * Returns a string containing as many code units as necessary
   * to represent the Unicode code points given by the first argument.
   * @author Norbert Lindenberg
   * @see http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/
   * @param {number[]} codePoints Array of Unicode code points
   * @throws {Error} Throws an error when encountering an invalid code point.
   * @returns {String} String (UCS-2)
   */
  static stringFromCodePoints (codePoints) {
    let chars = []

    codePoints.forEach((codePoint, index) => {
      if (TextEncoder.validateCodePoint(codePoint)) {
        throw new TextEncodingError(
          `Invalid code point '${codePoint}' at index ${index}`)
      }

      if (codePoint < 0x10000) {
        // BMP character
        chars.push(codePoint)
      } else {
        // character with surrogates
        codePoint -= 0x10000
        chars.push((codePoint >> 10) + 0xD800)
        chars.push((codePoint % 0x400) + 0xDC00)
      }
    })

    // create string from char codes
    // doing this in a way that does not cause a RangeError due to too many args
    return chars.map(charCode => String.fromCharCode(charCode)).join('')
  }

  /**
   * Creates an array containing the numeric code points of each Unicode
   * character in the string. While JavaScript uses UCS-2 internally,
   * this function will convert a pair of surrogate halves (each of which
   * UCS-2 exposes as separate characters) into a single code point,
   * matching UTF-16.
   * @author Mathias Bynens
   * @see https://github.com/bestiejs/punycode.js
   * @param {String} string String (UCS-2)
   * @returns {number[]} Array of Unicode code points
   */
  static codePointsFromString (string) {
    const codePoints = []
    const length = string.length
    let i = 0

    while (i < length) {
      const value = string.charCodeAt(i++)

      if (value >= 0xD800 && value <= 0xDBFF && i < length) {
        // it's a high surrogate, and there is a next character
        const extra = string.charCodeAt(i++)

        if ((extra & 0xFC00) === 0xDC00) {
          // low surrogate
          codePoints.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000)
        } else {
          // it's an unmatched surrogate; only append this code unit, in case
          // the next code unit is the high surrogate of a surrogate pair
          codePoints.push(value)
          i--
        }
      } else {
        codePoints.push(value)
      }
    }

    return codePoints
  }

  /**
   * Encodes Unicode code points to bytes using given encoding.
   * @param {number[]} codePoints
   * @param {String} [encoding='utf8']
   * @throws {Error} Throws an error if given encoding is not supported.
   * @throws {Error} Throws an error when encountering an invalid code point.
   * @return {Uint8Array} Uint8Array of bytes
   */
  static bytesFromCodePoints (codePoints, encoding = 'utf8') {
    switch (encoding) {
      case 'utf8':
        return TextEncoder._encodeCodePointsToUTF8Bytes(codePoints)
      default:
        throw new Error(
          `Encoding to '${encoding}' is currently not supported.`)
    }
  }

  /**
   * Decodes Unicode code points from bytes using given encoding.
   * @param {Uint8Array} bytes
   * @param {String} [encoding='utf8']
   * @throws {Error} Throws an error if given encoding is not supported.
   * @throws {TextEncodingError} Throws an error if given bytes are malformed.
   * @return {number[]} Array of Unicode code points
   */
  static codePointsFromBytes (bytes, encoding = 'utf8') {
    switch (encoding) {
      case 'utf8':
        return TextEncoder._decodeCodePointsFromUTF8Bytes(bytes)
      default:
        throw new Error(
          `Decoding from '${encoding}' is currently not supported.`)
    }
  }

  static _encodeCodePointsToUTF8Bytes (codePoints) {
    const bytes = []

    codePoints.forEach((codePoint, index) => {
      if (TextEncoder.validateCodePoint(codePoint)) {
        throw new TextEncodingError(
          `Invalid code point '${codePoint}' at ${index}`)
      }
      // append code point bytes
      if (codePoint <= 0x7F) {
        // 1 byte: 0xxxxxxx
        bytes.push(codePoint)
      } else if (codePoint <= 0x7FF) {
        // 2 bytes: 110xxxxx 10xxxxxx
        bytes.push(0b11000000 | (codePoint >> 6))
        bytes.push(0b10000000 | (codePoint % 64))
      } else if (codePoint <= 0xFFFF) {
        // 3 bytes: 1110xxxx 10xxxxxx 10xxxxxx
        bytes.push(0b11100000 | (codePoint >> 12))
        bytes.push(0b10000000 | (codePoint % 4096 >> 6))
        bytes.push(0b10000000 | (codePoint % 64))
      } else {
        // 4 bytes: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        bytes.push(0b11110000 | (codePoint >> 18))
        bytes.push(0b10000000 | (codePoint % 262144 >> 12))
        bytes.push(0b10000000 | (codePoint % 4096 >> 6))
        bytes.push(0b10000000 | (codePoint % 64))
      }
    })

    return new Uint8Array(bytes)
  }

  static _decodeCodePointsFromUTF8Bytes (bytes) {
    const codePoints = []
    const size = bytes.length
    let remainingBytes = 0
    let i = -1
    let byte
    let codePoint

    while (++i < size) {
      byte = bytes[i]

      if (byte > 0b01111111 && byte <= 0b10111111) {
        // this is a continuation byte
        if (--remainingBytes < 0) {
          throw new TextEncodingError(
            `Invalid UTF-8 encoded text: ` +
            `Unexpected continuation byte at 0x${i.toString(16)}`, i)
        }

        // append bits to current code point
        codePoint = (codePoint << 6) | (byte % 64)

        if (remainingBytes === 0) {
          // completed a code point
          codePoints.push(codePoint)
        }
      } else if (remainingBytes > 0) {
        // this must be a continuation byte
        throw new TextEncodingError(
          `Invalid UTF-8 encoded text: ` +
          `Continuation byte expected at 0x${i.toString(16)}`, i)
      } else if (byte <= 0b01111111) {
        // 1 byte code point
        // this already is a complete code point
        codePoints.push(byte)
      } else if (byte <= 0b11011111) {
        // 2 byte code point
        codePoint = byte % 32
        remainingBytes = 1
      } else if (byte <= 0b11101111) {
        // 3 byte code point
        codePoint = byte % 16
        remainingBytes = 2
      } else if (byte <= 0b11110111) {
        // 4 byte code point
        codePoint = byte % 8
        remainingBytes = 3
      } else {
        throw new TextEncodingError(
          `Invalid UTF-8 encoded text: ` +
          `Invalid byte ${byte} at 0x${i.toString(16)}`, i)
      }
    }

    if (remainingBytes !== 0) {
      throw new TextEncodingError(
        `Invalid UTF-8 encoded text: Unexpected end of bytes`)
    }

    return codePoints
  }
}
