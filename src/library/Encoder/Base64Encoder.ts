
import EncoderError from './EncoderError'
import StringUtil from '../Util/StringUtil'

/**
 * Base64 options type
 */
export type Base64EncoderOptions = {
  /**
   * String with 64 characters to be used as the Base64 alphabet.
   * Defaults to the standard Base64 alphabet `A-Za-z0-9+/`
   */
  alphabet?: string

  /**
   * Padding character, defaults to `=`
   */
  padding?: string

  /**
   * Wether padding is optional, defaults to false
   */
  paddingOptional?: boolean

  /**
   * Wether to allow characters that are not part of the alphabet, the padding
   * or the line separator
   */
  allowForeignCharacters?: boolean

  /**
   * Line length at which the string should be wrapped, defaults to `undefined`
   */
  wrapLength?: number

  /**
   * Line separator used when wrapping the string, defaults to `\r\n`
   */
  lineSeparator?: string
}

/**
 * Use Standard Base64 options by default
 */
const defaultOptions: Base64EncoderOptions = {
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  padding: '=',
  paddingOptional: false,
  allowForeignCharacters: false,
  wrapLength: undefined,
  lineSeparator: '\r\n',
}

/**
 * Utility class providing static methods for Base64 encoding and decoding.
 */
export default class Base64Encoder {
  /**
   * Encodes the given binary data to a Base64 string.
   * @param data - Binary data
   * @param options - Base64 options
   * @returns Base64 string
   */
  static encode (data: Uint8Array, options?: Base64EncoderOptions): string {
    // Merge options
    const {
      alphabet,
      padding,
      paddingOptional,
      wrapLength,
      lineSeparator
    } = Object.assign({}, defaultOptions, options)

    // Choose padding
    const paddingCharacter = !paddingOptional && padding ? padding : ''

    // Encode each 3-byte-pair
    let string = ''
    let byte1, byte2, byte3
    let octet1, octet2, octet3, octet4

    for (let i = 0; i < data.length; i += 3) {
      // Collect pair bytes
      byte1 = data[i]
      byte2 = i + 1 < data.length ? data[i + 1] : NaN
      byte3 = i + 2 < data.length ? data[i + 2] : NaN

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
        alphabet![octet1] +
        alphabet![octet2] +
        (!isNaN(byte2) ? alphabet![octet3] : paddingCharacter) +
        (!isNaN(byte3) ? alphabet![octet4] : paddingCharacter)
    }

    // Wrap result if requested
    if (wrapLength) {
      string = StringUtil.chunk(string, wrapLength!).join(lineSeparator)
    }

    return string
  }

  /**
   * Decodes the given Base64 string to binary data.
   * @param string - Base64 string
   * @param options - Base64 options
   * @returns Base64 decoded binary data
   */
  static decode (string: string, options?: Base64EncoderOptions): Uint8Array {
    // Merge options
    const {
      alphabet,
      padding,
      paddingOptional,
      allowForeignCharacters,
      wrapLength,
      lineSeparator
    } = Object.assign({}, defaultOptions, options)

    // Translate each character into an octet
    const length = string.length
    const octets = []
    let character, octet
    let i = -1

    // Go through each character
    while (++i < length) {
      character = string[i]

      if (wrapLength !== undefined &&
          lineSeparator &&
          character === lineSeparator[0] &&
          string.substr(i, lineSeparator.length) === lineSeparator) {
        // This is a line separator, skip it
        i = i + lineSeparator.length - 1
      } else if (character === padding) {
        // This is a pad character, ignore it
      } else {
        // This is an octet or a foreign character
        octet = alphabet!.indexOf(character)
        if (octet !== -1) {
          octets.push(octet)
        } else if (!allowForeignCharacters) {
          throw new EncoderError(
            `Forbidden character '${character}' at index ${i}`, i)
        }
      }
    }

    // Calculate original padding and verify it
    const paddingSize = (4 - octets.length % 4) % 4
    if (paddingSize === 3) {
      throw new EncoderError(
        `A single remaining encoded character in the last quadruple or a ` +
        `padding of 3 characters is not allowed`)
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
