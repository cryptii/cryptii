
const base64BaseAlphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

const base64VariantOptions = {
  base64: {
    alphabet: base64BaseAlphabet + '+/',
    padCharacter: '=',
    padCharacterOptional: false
  },
  base64url: {
    alphabet: base64BaseAlphabet + '-_',
    padCharacter: '=',
    padCharacterOptional: true
  }
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
    return bytes.reduce((string, byte) => {
      return string + ('0' + byte.toString(16)).slice(-2)
    }, '')
  }

  /**
   * Returns bytes from given hex string.
   * @param {string} string Hex string
   * @return {Uint8Array} Bytes
   */
  static bytesFromHexString (string) {
    // fill up leading zero
    if (string.length % 2 === 1) {
      string = '0' + string
    }

    // decode each byte
    let bytes = []
    let byteString = ''
    let byte = 0

    for (let i = 0; i < string.length; i += 2) {
      byteString = string[i] + string[i + 1]
      byte = parseInt(byteString, 16)
      if (isNaN(byte)) {
        throw new Error(`Invalid byte "${byteString}" at index ${i}`)
      }
      bytes.push(byte)
    }

    return new Uint8Array(bytes)
  }

  /**
   * Returns base64 string representing given bytes.
   * @param {Uint8Array} bytes Bytes
   * @param {string} [variant='base64'] Base64 variant (base64, base64url)
   * @return {string} Base64 string
   */
  static base64StringFromBytes (bytes, variant = 'base64') {
    let options = base64VariantOptions[variant]
    let alphabet = options.alphabet
    let padCharacter = !options.padCharacterOptional && options.padCharacter
      ? options.padCharacter : ''

    // encode each 3-byte-pair
    let string = ''
    let byte1, byte2, byte3
    let octet1, octet2, octet3, octet4

    for (let i = 0; i < bytes.length; i += 3) {
      // collect pair bytes
      byte1 = bytes[i]
      byte2 = i + 1 < bytes.length ? bytes[i + 1] : NaN
      byte3 = i + 2 < bytes.length ? bytes[i + 2] : NaN

      // bits 1-6 from byte 1
      octet1 = byte1 >> 2

      // bits 7-8 from byte 1 joined by bits 1-4 from byte 2
      octet2 = ((byte1 & 3) << 4) | (byte2 >> 4)

      // bits 4-8 from byte 2 joined by bits 1-2 from byte 3
      octet3 = ((byte2 & 15) << 2) | (byte3 >> 6)

      // bits 3-8 from byte 3
      octet4 = byte3 & 63

      // map octets to characters
      string +=
        alphabet[octet1] +
        alphabet[octet2] +
        (!isNaN(byte2) ? alphabet[octet3] : padCharacter) +
        (!isNaN(byte3) ? alphabet[octet4] : padCharacter)
    }

    return string
  }

  /**
   * Returns bytes from given base64 string.
   * @param {string} string Base64 string
   * @param {string} [variant='base64']  Base64 variant (base64, base64url)
   * @return {Uint8Array} Bytes
   */
  static bytesFromBase64String (string, variant = 'base64') {
    let options = base64VariantOptions[variant]
    let alphabet = options.alphabet

    // translate each character into an octet
    let length = string.length
    let octets = []
    let character, octet
    let i = -1

    while (++i < length) {
      character = string[i]
      octet = alphabet.indexOf(character)
      if (octet === -1) {
        if (character !== options.padCharacter) {
          throw new Error(`Invalid character "${character}" at index ${i}`)
        }
      } else {
        octets.push(octet)
      }
    }

    // decode each pair of 4 characters
    let bytes = []
    let octet1, octet2, octet3, octet4

    for (let i = 0; i < octets.length; i += 4) {
      // collect octets
      octet1 = octets[i]
      octet2 = i + 1 < octets.length ? octets[i + 1] : 0
      octet3 = i + 2 < octets.length ? octets[i + 2] : 0
      octet4 = i + 3 < octets.length ? octets[i + 3] : 0

      // bits 1-6 from octet1 joined by bits 1-2 from octet2
      bytes.push((octet1 << 2) | (octet2 >> 4))

      // bits 3-6 from octet2 joined by bits 1-4 from octet3
      let byte2 = ((octet2 & 15) << 4) | (octet3 >> 2)

      if (i + 2 < octets.length || byte2 !== 0) {
        bytes.push(byte2)
      }

      // bits 1-2 from octet3 joined by bits 1-6 from octet4
      let byte3 = ((octet3 & 3) << 6) | octet4

      if (i + 3 < octets.length || byte3 !== 0) {
        bytes.push(byte3)
      }
    }

    return new Uint8Array(bytes)
  }
}
