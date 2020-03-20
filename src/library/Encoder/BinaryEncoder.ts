
import EncoderError from './EncoderError'
import StringUtil from '../Util/StringUtil'

/**
 * Utility class providing static methods for binary and hexadecimal encoding.
 * @todo Support binary data of arbitrary bit size from Chain objects
 */
export default class BinaryEncoder {
  /**
   * Returns the hexadecimal string representing the given binary data.
   * @param data - Binary data
   * @returns Hexadecimal string
   */
  static hexEncode (data: Uint8Array): string {
    return Array.from(data)
      .map(byte => ('0' + byte.toString(16)).slice(-2))
      .join('')
  }

  /**
   * Returns the binary data represented by the given hexadecimal string.
   * @param string - Hexadecimal string
   * @returns Binary data
   */
  static hexDecode (string: string): Uint8Array {
    string = StringUtil.replaceWhitespace(string, '')

    // Fill up bytes with trailing zeros
    if (string.length % 2 === 1) {
      string = string + '0'
    }

    // Decode each byte
    const bytes = StringUtil.chunk(string, 2).map((byteString, i) => {
      const byte = parseInt(byteString, 16)
      if (byteString.match(/[0-9a-f]{2}/i) === null || isNaN(byte)) {
        throw new EncoderError(`Invalid hex encoded byte '${byteString}'`, i)
      }
      return byte
    })

    return new Uint8Array(bytes)
  }

  /**
   * Returns the binary string representing of the given binary data.
   * @param data - Binary data
   * @returns Binary string (with 1s and 0s)
   */
  static binaryEncode (data: Uint8Array): string {
    return Array.from(data)
      .map(byte => ('0000000' + byte.toString(2)).slice(-8))
      .join('')
  }

  /**
   * Returns the binary data represented by the given binary string.
   * @param string - Binary string (with 1s and 0s)
   * @returns Binary data
   */
  static binaryDecode (string: string): Uint8Array {
    string = StringUtil.replaceWhitespace(string, '')

    // Fill up with trailing zeros
    if (string.length % 8 > 0) {
      string = string.padEnd(string.length - (string.length % 8) + 8, '0')
    }

    // Decode each byte
    const bytes = StringUtil.chunk(string, 8).map((byteString, i) => {
      const byte = parseInt(byteString, 2)
      if (byteString.match(/[0-1]{8}/) === null || isNaN(byte)) {
        throw new EncoderError(`Invalid binary encoded byte '${byteString}'`, i)
      }
      return byte
    })

    return new Uint8Array(bytes)
  }
}
