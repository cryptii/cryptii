import TextEncodingError from './Error/TextEncoding.js'

/**
 * Utility class providing static methods for string, Unicode code point
 * and byte translation.
 */
export default class TextEncoder {
  /**
   * Validates singlecode point.
   * @param {number} codePoint
   * @return {boolean} True, if valid
   */
  static validateCodePoint (codePoint) {
    return (
      isFinite(codePoint) &&
      codePoint >= 0 &&
      codePoint <= 0x10FFFF &&
      Math.floor(codePoint) === codePoint
    )
  }

  /**
   * Validates given array of code points.
   * @param {number[]} codePoints
   * @return {boolean} True, if valid
   */
  static validateCodePoints (codePoints) {
    let valid = true
    let i = 0
    while (valid && i < codePoints.length) {
      valid = TextEncoder.validateCodePoint(codePoints[i])
      i++
    }
    return valid
  }

  /**
   * Returns a string containing as many code units as necessary
   * to represent the Unicode code points given by the first argument.
   * @author Norbert Lindenberg
   * @see http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/
   * @param {number[]} codePoints Array of Unicode code points
   * @returns {String} String (UCS-2)
   */
  static stringFromCodePoints (codePoints) {
    // In the worst case every code point needs to be translated to two
    // surrogates each
    // Create a fixed size array that gets sliced at the end
    const codeUnits = new Array(codePoints.length * 2)
    let j = 0
    let i, codePoint

    for (i = 0; i < codePoints.length; i++) {
      codePoint = codePoints[i]

      if (codePoint < 0x10000) {
        // Basic Multilingual Plane (BMP) character
        codeUnits[j++] = String.fromCharCode(codePoint)
      } else {
        // Character with surrogates
        codePoint -= 0x10000
        codeUnits[j++] = String.fromCharCode((codePoint >> 10) + 0xD800)
        codeUnits[j++] = String.fromCharCode((codePoint % 0x400) + 0xDC00)
      }
    }

    // Slice the fixed size array to the portion actually in use and concatenate
    // it to a string
    return codeUnits.slice(0, j).join('')
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
    // In the worst case every string code unit needs to be translated to
    // a single code point each
    // Create a fixed size array that gets sliced at the end
    const length = string.length
    const codePoints = new Array(length)

    let codeUnit, nextCodeUnit
    let j = 0
    let i = 0

    while (i < length) {
      codeUnit = string.charCodeAt(i++)

      if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF && i < length) {
        // Identified a high surrogate
        nextCodeUnit = string.charCodeAt(i++)

        // There is a next character
        if ((nextCodeUnit & 0xFC00) === 0xDC00) {
          // Low surrogate
          codePoints[j++] =
            ((codeUnit & 0x3FF) << 10) +
            (nextCodeUnit & 0x3FF) +
            0x10000
        } else {
          // Unmatched surrogate; Only append this code unit, in case
          // the next code unit is the high surrogate of a surrogate pair
          codePoints[j++] = codeUnit
          i--
        }
      } else {
        // Identified BMP character
        codePoints[j++] = codeUnit
      }
    }

    // Slice the fixed size array to the portion actually in use
    return codePoints.slice(0, j)
  }

  /**
   * Encodes Unicode code points to bytes using given encoding.
   * @param {number[]} codePoints
   * @param {String} [encoding='utf8']
   * @throws {Error} Throws an error if given encoding is not supported.
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
    // In the worst case every code point needs to be represented by 4 bytes
    // Create a fixed size array that gets sliced at the end
    const bytes = new Uint8Array(codePoints.length * 4)
    let j = 0
    let i, codePoint

    for (i = 0; i < codePoints.length; i++) {
      codePoint = codePoints[i]

      if (codePoint <= 0x7F) {
        // 1 byte: 0xxxxxxx
        bytes[j++] = codePoint
      } else if (codePoint <= 0x7FF) {
        // 2 bytes: 110xxxxx 10xxxxxx
        bytes[j++] = 0b11000000 | (codePoint >> 6)
        bytes[j++] = 0b10000000 | (codePoint & 0x3F)
      } else if (codePoint <= 0xFFFF) {
        // 3 bytes: 1110xxxx 10xxxxxx 10xxxxxx
        bytes[j++] = 0b11100000 | (codePoint >> 12)
        bytes[j++] = 0b10000000 | ((codePoint & 0xFFF) >> 6)
        bytes[j++] = 0b10000000 | (codePoint & 0x3F)
      } else {
        // 4 bytes: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        bytes[j++] = 0b11110000 | (codePoint >> 18)
        bytes[j++] = 0b10000000 | ((codePoint & 0x3FFFF) >> 12)
        bytes[j++] = 0b10000000 | ((codePoint & 0xFFF) >> 6)
        bytes[j++] = 0b10000000 | (codePoint & 0x3F)
      }
    }

    // Slice the fixed size array to the portion actually in use
    return bytes.slice(0, j)
  }

  static _decodeCodePointsFromUTF8Bytes (bytes) {
    // In the worst case byte needs to be represented by one code point
    // Create a fixed size array that gets sliced at the end
    const size = bytes.length
    const codePoints = new Array(size)

    let remainingBytes = 0
    let i = -1
    let j = 0
    let byte, codePoint

    while (++i < size) {
      byte = bytes[i]

      if (byte > 0b01111111 && byte <= 0b10111111) {
        // Continuation byte identified
        if (--remainingBytes < 0) {
          throw new TextEncodingError(
            'Invalid UTF-8 encoded text: ' +
            `Unexpected continuation byte at 0x${i.toString(16)}`, i)
        }

        // Append bits to current code point
        codePoint = (codePoint << 6) | (byte & 0x3F)

        if (remainingBytes === 0) {
          // Completed a code point
          codePoints[j++] = codePoint
        }
      } else if (remainingBytes > 0) {
        // this must be a continuation byte
        throw new TextEncodingError(
          'Invalid UTF-8 encoded text: ' +
          `Continuation byte expected at 0x${i.toString(16)}`, i)
      } else if (byte <= 0b01111111) {
        // 1 byte code point
        codePoints[j++] = byte
      } else if (byte <= 0b11011111) {
        // 2 byte code point
        codePoint = byte & 0b00011111
        remainingBytes = 1
      } else if (byte <= 0b11101111) {
        // 3 byte code point
        codePoint = byte & 0b00001111
        remainingBytes = 2
      } else if (byte <= 0b11110111) {
        // 4 byte code point
        codePoint = byte & 0b00000111
        remainingBytes = 3
      } else {
        throw new TextEncodingError(
          'Invalid UTF-8 encoded text: ' +
          `Invalid byte ${byte} at 0x${i.toString(16)}`, i)
      }
    }

    if (remainingBytes !== 0) {
      throw new TextEncodingError(
        'Invalid UTF-8 encoded text: Unexpected end of bytes')
    }

    // Slice the fixed size array to the portion actually in use
    return codePoints.slice(0, j)
  }
}
