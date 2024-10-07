import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'
import TextEncodingError from '../Error/TextEncoding.js'

const meta = {
  name: 'url-encoding',
  title: 'URL encoding',
  category: 'Encoding',
  type: 'encoder'
}

// RFC 3986 2.3
const unreservedURLCharacters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~'

/**
 * Encoder brick for URL encoding
 */
export default class URLEncoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    try {
      // Try to URL encode string representation of content
      const chars = content.getChars()
      let string = ''
      let char
      for (let i = 0; i < chars.length; i++) {
        char = chars[i]
        string += unreservedURLCharacters.indexOf(char) === -1
          ? this.encodeBytes(content.getCharBytesAt(i))
          : char
      }
      return string
    } catch (error) {
      // Retrieving the string representation of the content may throw an error
      // due to bad UTF-8 encoded text
      if (error instanceof TextEncodingError) {
        // Encode raw bytes (which do not need to be valid UTF-8)
        return this.encodeBytes(content.getBytes())
      } else {
        throw error
      }
    }
  }

  /**
   * Percent-encode bytes.
   * @param {Uint8Array} bytes Bytes
   * @return {string} URL encoded bytes
   */
  encodeBytes (bytes) {
    let string = ''
    for (let i = 0; i < bytes.length; i++) {
      string += '%' + ('0' + bytes[i].toString(16)).slice(-2)
    }
    return string
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    const string = content.getString()
    const bytes = []
    let i = 0

    // Go through string and collect bytes
    let char, byteString
    while (i < string.length) {
      char = string[i]

      if (char === '%') {
        // Check if byte is a valid 2-digit hex string
        byteString = string.substr(i + 1, 2)
        if (byteString.match(/[0-9a-f]{2}/i) === null) {
          throw new InvalidInputError(
            `Invalid percent-encoded byte '%${byteString}' at index ${i}`)
        }

        // Decode byte
        bytes.push(parseInt(byteString, 16))
        i += 3
      } else if (char === '+') {
        // Handle spaces (defined in early versions of percent-encoding)
        bytes.push(32)
        i++
      } else if (unreservedURLCharacters.indexOf(char) !== -1) {
        // Append unreserved character
        bytes.push(char.charCodeAt(0))
        i++
      } else {
        // Invalid character met
        throw new InvalidInputError(
          `Invalid character '${char}' at index ${i}`)
      }
    }

    // This may fail due to invalid UTF-8 encoding
    return new Uint8Array(bytes)
  }
}
