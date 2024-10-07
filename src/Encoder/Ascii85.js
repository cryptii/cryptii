import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'
import StringUtil from '../StringUtil.js'

const meta = {
  name: 'ascii85',
  title: 'Ascii85',
  category: 'Encoding',
  type: 'encoder'
}

const variantSpecs = [
  {
    name: 'original',
    label: 'Original',
    alphabet: null,
    zeroTupleChar: 'z'
  },
  {
    name: 'Z85',
    label: 'Z85 (ZeroMQ)',
    alphabet:
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFG' +
      'HIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#',
    zeroTupleChar: null
  }
]

/**
 * Encoder brick for Ascii85/Base85 encoding and decoding
 */
export default class Ascii85Encoder extends Encoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Constructor
   */
  constructor () {
    super()
    this.addSetting({
      name: 'variant',
      type: 'enum',
      label: 'Variant',
      value: 'original',
      elements: variantSpecs.map(variant => variant.name),
      labels: variantSpecs.map(variant => variant.label),
      randomizable: false
    })
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    const bytes = content.getBytes()
    const variant = variantSpecs.find(variant =>
      variant.name === this.getSettingValue('variant'))
    const n = bytes.length

    // Encode each tuple of 4 bytes
    let string = ''
    let digits, j, tuple
    for (let i = 0; i < n; i += 4) {
      // Read 32-bit unsigned integer from bytes following the
      // big-endian convention (most significant byte first)
      tuple = (
        ((bytes[i]) << 24) +
        ((bytes[i + 1] || 0) << 16) +
        ((bytes[i + 2] || 0) << 8) +
        ((bytes[i + 3] || 0))
      ) >>> 0

      if (variant.zeroTupleChar === null || tuple > 0) {
        // Calculate 5 digits by repeatedly dividing
        // by 85 and taking the remainder
        digits = []
        for (j = 0; j < 5; j++) {
          digits.push(tuple % 85)
          tuple = Math.floor(tuple / 85)
        }

        // Take most significant digit first
        digits = digits.reverse()

        if (n < i + 4) {
          // Omit final characters added due to bytes of padding
          digits.splice(n - (i + 4), 4)
        }

        // Convert digits to characters and glue them together
        string += digits.map(digit =>
          variant.alphabet === null
            ? String.fromCharCode(digit + 33)
            : variant.alphabet[digit]
        ).join('')
      } else {
        // An all-zero tuple is encoded as a single character
        string += variant.zeroTupleChar
      }
    }

    return string
  }

  /**
   * Triggered before performing decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Filtered content
   */
  willDecode (content) {
    // Check for <~ ~> wrappers often used to wrap ascii85 encoded data
    const wrapperMatches = content.getString().match(/<~(.+?)~>/)
    if (wrapperMatches !== null) {
      // Decode wrapped data only
      return wrapperMatches[1]
    }
    return content
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    const string = StringUtil.removeWhitespaces(content.getString())
    const variant = variantSpecs.find(variant =>
      variant.name === this.getSettingValue('variant'))
    const n = string.length

    // Decode each tuple of 5 characters
    const bytes = []
    let i = 0
    let digits, tuple, tupleBytes
    while (i < n) {
      if (string[i] === variant.zeroTupleChar) {
        // A single character encodes an all-zero tuple
        bytes.push(0, 0, 0, 0)
        i++
      } else {
        // Retrieve radix-85 digits of tuple
        digits = string
          .substr(i, 5)
          .split('')
          .map((character, index) => {
            const digit =
              variant.alphabet === null
                ? character.charCodeAt(0) - 33
                : variant.alphabet.indexOf(character)
            if (digit < 0 || digit > 84) {
              throw new InvalidInputError(
                `Invalid character '${character}' at index ${index}`)
            }
            return digit
          })

        // Create 32-bit binary number from digits and handle padding
        // tuple = a * 85^4 + b * 85^3 + c * 85^2 + d * 85 + e
        tuple =
          digits[0] * 52200625 +
          digits[1] * 614125 +
          (i + 2 < n ? digits[2] : 84) * 7225 +
          (i + 3 < n ? digits[3] : 84) * 85 +
          (i + 4 < n ? digits[4] : 84)

        // Get bytes from tuple
        tupleBytes = [
          (tuple >> 24) & 0xff,
          (tuple >> 16) & 0xff,
          (tuple >> 8) & 0xff,
          tuple & 0xff
        ]

        // Remove bytes of padding
        if (n < i + 5) {
          tupleBytes.splice(n - (i + 5), 5)
        }

        // Append bytes to result
        bytes.push.apply(bytes, tupleBytes)
        i += 5
      }
    }

    return new Uint8Array(bytes)
  }
}
