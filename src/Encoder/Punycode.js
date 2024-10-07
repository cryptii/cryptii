import BootstringEncoder from './Bootstring.js'
import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'

const meta = {
  name: 'punycode',
  title: 'Punycode',
  category: 'Encoding',
  type: 'encoder'
}

/**
 * Punycode settings as described in section 5 of RFC 3492.
 * @type {object}
 */
const bootstringSettingValues = {
  basicRangeStart: 0,
  basicRangeEnd: 127,
  digitMapping: 'abcdefghijklmnopqrstuvwxyz0123456789',
  delimiter: '-',
  caseSensitivity: false,
  initialBias: 72,
  initialN: 128,
  tmin: 1,
  tmax: 26,
  skew: 38,
  damp: 700
}

/**
 * IDNA prefix
 * @type {string}
 */
const prefix = 'xn--'

/**
 * Encoder brick for Punycode encoding and decoding following RFC 3492.
 */
export default class PunycodeEncoder extends Encoder {
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

    // Create internal bootstring encoder instance
    this._bootstringEncoder = new BootstringEncoder()
    this._bootstringEncoder.setSettingValues(bootstringSettingValues)
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  async performEncode (content) {
    // Punycode is case insensitive, lowercase the content before continuing
    content = content.toLowerCase()

    // Split domain into labels
    const labels = content.split('.')
    const encodedParts = new Array(labels.length)

    // Encode each part separately
    for (let i = 0; i < labels.length; i++) {
      // Check if the code points are all basic
      if (this._nonBasicCodePointIndex(labels[i].getCodePoints()) === -1) {
        // Return the part as is
        encodedParts[i] = labels[i]
      } else {
        // Encode part using Bootstring and prepend IDNA prefix
        const result = await this._bootstringEncoder.encode(labels[i])
        encodedParts[i] = prefix + result.getString()
      }
    }

    // Stick domain labels back together
    return Chain.join(encodedParts, '.')
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  async performDecode (content) {
    // Check if the given input contains any unexpected non-basic code points
    const nonBasicIndex = this._nonBasicCodePointIndex(content.getCodePoints())
    if (nonBasicIndex !== -1) {
      throw new InvalidInputError(
        `Invalid Punycode character at index ${nonBasicIndex}`)
    }

    // Split domain into labels
    const labels = content.split('.')
    const decodedParts = new Array(labels.length)

    // Decode each part separately
    for (let i = 0; i < labels.length; i++) {
      // Check for the IDNA prefix
      if (labels[i].indexOf(prefix) !== 0) {
        // Return the part as is
        decodedParts[i] = labels[i]
      } else {
        // Remove IDNA prefix and decode part using Bootstring
        const part = labels[i].substr(prefix.length)
        decodedParts[i] = await this._bootstringEncoder.decode(part)
      }
    }

    // Stick domain labels back together
    return Chain.join(decodedParts, '.')
  }

  /**
   * Returns the first non-basic code point, if any.
   * @param {number[]} codePoints Code points
   * @return {number} Index of first non-basic code point or -1, if the code
   * points are all basic.
   */
  _nonBasicCodePointIndex (codePoints) {
    return codePoints.findIndex(codePoint => codePoint >= 0x80)
  }
}
