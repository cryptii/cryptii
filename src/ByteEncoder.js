import StringUtil from './StringUtil.js'
import ByteEncodingError from './Error/ByteEncoding.js'

/**
 * Default Base64 options
 * @type {object}
 */
const defaultBase64Options = {
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  padding: '=',
  paddingOptional: false,
  foreignCharacters: false,
  maxLineLength: null,
  lineSeparator: '\r\n'
}

/**
 * Utility class providing static methods for translations
 * between bytes and strings.
 */
export default class ByteEncoder {
  /**
   * Returns hex string representing given bytes.
   * @param {Uint8Array} bytes Bytes
   * @return {string} Hex string
   */
  static hexStringFromBytes (bytes) {
    return Array.from(bytes)
      .map(byte => ('0' + byte.toString(16)).slice(-2))
      .join('')
  }

  /**
   * Returns bytes from given hex string.
   * @param {string} string Hex string
   * @return {Uint8Array} Bytes
   */
  static bytesFromHexString (string) {
    string = StringUtil.removeWhitespaces(string)

    // Fill up bytes with trailing zeros
    if (string.length % 2 === 1) {
      string = string + '0'
    }

    // Decode each byte
    const bytes = StringUtil.chunk(string, 2).map((byteString, index) => {
      const byte = parseInt(byteString, 16)
      if (byteString.match(/[0-9a-f]{2}/i) === null || isNaN(byte)) {
        throw new ByteEncodingError(
          `Invalid hex encoded byte '${byteString}'`)
      }
      return byte
    })

    return new Uint8Array(bytes)
  }

  /**
   * Returns binary string representing given bytes.
   * @param {Uint8Array} bytes Bytes
   * @return {string} Binary string
   */
  static binaryStringFromBytes (bytes) {
    return Array.from(bytes)
      .map(byte => ('0000000' + byte.toString(2)).slice(-8))
      .join('')
  }

  /**
   * Returns bytes from given binary string.
   * @param {string} string Binary string
   * @return {Uint8Array} Bytes
   */
  static bytesFromBinaryString (string) {
    string = StringUtil.removeWhitespaces(string)

    // Fill up with trailing zeros
    if (string.length % 8 > 0) {
      string = string.padEnd(string.length - (string.length % 8) + 8, '0')
    }

    // Decode each byte
    const bytes = StringUtil.chunk(string, 8).map((byteString, index) => {
      const byte = parseInt(byteString, 2)
      if (byteString.match(/[0-1]{8}/) === null || isNaN(byte)) {
        throw new ByteEncodingError(
          `Invalid binary encoded byte '${byteString}'`)
      }
      return byte
    })

    return new Uint8Array(bytes)
  }

  /**
   * Returns base64 string representing given bytes.
   * @param {Uint8Array} bytes Bytes
   * @param {object} [options] Base64 options
   * @param {string} [options.alphabet] Base64 alphabet
   * @param {string} [options.padding='='] Padding character
   * @param {boolean} [options.paddingOptional=false] Wether padding is optional
   * @param {boolean} [options.foreignCharacters=false] Wether foreign
   * @param {number|null} [options.maxLineLength=null] Maximum line length
   * @param {string} [options.lineSeparator='\r\n'] Line separator, if
   * having a maximum line length.
   * @return {string} Base64 string
   */
  static base64StringFromBytes (bytes, options = {}) {
    // Compose options
    const {
      alphabet,
      padding,
      paddingOptional,
      maxLineLength,
      lineSeparator
    } = Object.assign({}, defaultBase64Options, options)

    // Choose padding
    const paddingCharacter = !paddingOptional && padding ? padding : ''

    // Encode each 3-byte-pair
    let string = ''
    let byte1, byte2, byte3
    let octet1, octet2, octet3, octet4

    for (let i = 0; i < bytes.length; i += 3) {
      // Collect pair bytes
      byte1 = bytes[i]
      byte2 = i + 1 < bytes.length ? bytes[i + 1] : NaN
      byte3 = i + 2 < bytes.length ? bytes[i + 2] : NaN

      // Bits 1-6 from byte 1
      octet1 = byte1 >> 2

      // Bits 7-8 from byte 1 joined by bits 1-4 from byte 2
      octet2 = ((byte1 & 3) << 4) | (byte2 >> 4)

      // Bits 4-8 from byte 2 joined by bits 1-2 from byte 3
      octet3 = ((byte2 & 15) << 2) | (byte3 >> 6)

      // Bits 3-8 from byte 3
      octet4 = byte3 & 63

      // Map octets to characters
      string +=
        alphabet[octet1] +
        alphabet[octet2] +
        (!isNaN(byte2) ? alphabet[octet3] : paddingCharacter) +
        (!isNaN(byte3) ? alphabet[octet4] : paddingCharacter)
    }

    if (maxLineLength) {
      // Limit text line length, insert line separators
      let limitedString = ''
      for (let i = 0; i < string.length; i += maxLineLength) {
        limitedString +=
          (limitedString !== '' ? lineSeparator : '') +
          string.substr(i, maxLineLength)
      }
      string = limitedString
    }

    return string
  }

  /**
   * Returns bytes from given base64 string.
   * @param {string} string Base64 string
   * @param {object} [options] Base64 options
   * @param {string} [options.alphabet] Base64 alphabet
   * @param {string} [options.padding='='] Padding character
   * @param {boolean} [options.paddingOptional=false] Wether padding is optional
   * @param {boolean} [options.foreignCharacters=false] Wether foreign
   * characters are allowed inside Base64 encoded content.
   * @param {number|null} [options.maxLineLength=null] Maximum line length
   * @param {string} [options.lineSeparator='\r\n'] Line separator, if
   * having a maximum line length.
   * @throws {ByteEncodingError} If the string contains forbidden characters.
   * @throws {ByteEncodingError} If the string unexpectedly ends.
   * @return {string} Base64 string
   */
  static bytesFromBase64String (string, options = {}) {
    // Compose options
    const {
      alphabet,
      padding,
      foreignCharacters,
      maxLineLength,
      lineSeparator
    } = Object.assign({}, defaultBase64Options, options)

    // Translate each character into an octet
    const length = string.length
    const octets = []
    let character, octet
    let i = -1

    // Go through each character
    while (++i < length) {
      character = string[i]

      if (maxLineLength !== null &&
          lineSeparator &&
          character === lineSeparator[0] &&
          string.substr(i, lineSeparator.length) === lineSeparator) {
        // This is a line separator, skip it
        i = i + lineSeparator.length - 1
      } else if (character === padding) {
        // This is a pad character, ignore it
      } else {
        // This is an octet or a foreign character
        octet = alphabet.indexOf(character)
        if (octet !== -1) {
          octets.push(octet)
        } else if (!foreignCharacters) {
          throw new ByteEncodingError(
            `Forbidden character '${character}' at index ${i}`)
        }
      }
    }

    // Calculate original padding and verify it
    const paddingSize = (4 - octets.length % 4) % 4
    if (paddingSize === 3) {
      throw new ByteEncodingError(
        'A single remaining encoded character in the last quadruple or a ' +
        'padding of 3 characters is not allowed')
    }

    // Fill up octets
    for (i = 0; i < paddingSize; i++) {
      octets.push(0)
    }

    // Map pairs of octets (4) to pairs of bytes (3)
    const size = octets.length / 4 * 3
    const bytes = new Uint8Array(size)
    let j
    for (i = 0; i < octets.length; i += 4) {
      // Calculate byte index
      j = i / 4 * 3
      // Byte 1: bits 1-6 from octet 1 joined by bits 1-2 from octet 2
      bytes[j] = (octets[i] << 2) | (octets[i + 1] >> 4)
      // Byte 2: bits 3-6 from octet 2 joined by bits 1-4 from octet 3
      bytes[j + 1] = ((octets[i + 1] & 0b001111) << 4) | (octets[i + 2] >> 2)
      // Byte 3: bits 5-6 from octet 3 joined by bits 1-6 from octet 4
      bytes[j + 2] = ((octets[i + 2] & 0b000011) << 6) | octets[i + 3]
    }

    return bytes.slice(0, size - paddingSize)
  }
}
