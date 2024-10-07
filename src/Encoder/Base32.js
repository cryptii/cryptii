import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'

const meta = {
  name: 'base32',
  title: 'Base32',
  category: 'Encoding',
  type: 'encoder'
}

/**
 * Array of Base32 variant options.
 * @type {object[]}
 */
const variants = [
  {
    name: 'base32',
    label: 'Base32 (RFC 3548, RFC 4648)',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    padding: 0x3D,
    decodeMap: {
      0x30: 14,
      0x31: 8
    }
  },
  {
    name: 'base32hex',
    label: 'Base32hex (RFC 4648)',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
    padding: 0x3D
  },
  {
    name: 'z-base-32',
    label: 'z-base-32',
    alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
    padding: null
  },
  {
    name: 'crockford-base32',
    label: 'Crockford\'s Base32',
    alphabet: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
    padding: null,
    decodeContentFilter: 'uppercase',
    decodeMap: {
      0x4F: 0,
      0x49: 1,
      0x4C: 1
    }
  },
  {
    name: 'custom',
    label: 'Custom'
  }
]

/**
 * Encoder brick for base32 encoding and decoding
 */
export default class Base32Encoder extends Encoder {
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
    this.addSettings([
      {
        name: 'variant',
        type: 'enum',
        value: variants[0].name,
        elements: variants.map(variant => variant.name),
        labels: variants.map(variant => variant.label),
        randomizable: false
      },
      {
        name: 'alphabet',
        type: 'text',
        value: variants[0].alphabet,
        uniqueChars: true,
        minLength: 32,
        maxLength: 32,
        caseSensitivity: true,
        visible: false
      },
      {
        name: 'padding',
        type: 'text',
        value: '=',
        blacklistChars: variants[0].alphabet,
        minLength: 0,
        maxLength: 1,
        randomizable: false,
        visible: false
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Encoded content
   */
  performEncode (content) {
    const { alphabet, padding } = this.getVariantOptions()
    const alphabetCodePoints = alphabet.getCodePoints()

    // Prepare input and output arrays
    const input = content.getBytes()
    const inputLength = input.length
    const resultLength = Math.ceil(inputLength / 5) * 8
    const result = new Array(resultLength)
    let j = 0

    let shift = 3
    let carry = 0
    let byte, index

    // Go through every input byte
    for (let i = 0; i < inputLength; i++) {
      byte = input[i]

      index = carry | (byte >> shift)
      result[j++] = alphabetCodePoints[index & 0x1f]

      if (shift > 5) {
        shift -= 5
        index = byte >> shift
        result[j++] = alphabetCodePoints[index & 0x1f]
      }

      shift = 5 - shift
      carry = byte << shift
      shift = 8 - shift
    }

    if (shift !== 3) {
      result[j++] = alphabetCodePoints[carry & 0x1f]
    }

    // Finalize result padding
    if (padding !== null) {
      while (j < resultLength) {
        result[j++] = padding
      }
      return result
    } else {
      return result.slice(0, j)
    }
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain|Promise} Decoded content
   */
  performDecode (content) {
    const { alphabet, decodeMap, padding, decodeContentFilter } =
      this.getVariantOptions()

    // Apply variant filter before decoding
    if (decodeContentFilter === 'uppercase') {
      content = content.toUpperCase()
    }

    // Add alphabet characters to decode map
    for (let i = 0; i < alphabet.getLength(); i++) {
      decodeMap[alphabet.getCodePointAt(i)] = i
    }

    // Prepare input and output arrays
    const input = content.getCodePoints()
    const inputLength = input.length
    const resultSize = Math.ceil(inputLength / 8) * 5
    const result = new Uint8Array(resultSize)
    let j = 0

    let shift = 8
    let carry = 0
    let codePoint, index

    // Go through every input code point
    for (let i = 0; i < inputLength; i++) {
      codePoint = input[i]

      if (codePoint === padding) {
        // Ignore padding
      } else if (decodeMap[codePoint] === undefined) {
        // Unexpected code point not being part of the alphabet or map
        throw new InvalidInputError(`Unexpected code point at index ${i}`)
      } else {
        // Decode character
        index = decodeMap[codePoint] & 0xff
        shift -= 5
        if (shift > 0) {
          carry |= index << shift
        } else if (shift < 0) {
          result[j++] = carry | (index >> -shift)
          shift += 8
          carry = (index << shift) & 0xff
        } else {
          result[j++] = carry | index
          shift = 8
          carry = 0
        }
      }
    }

    // Slice result to remove padding
    return result.slice(0, j)
  }

  /**
   * Triggered when a setting field has changed.
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'variant': {
        // Make alphabet and padding settings available with the custom variant
        this.getSetting('alphabet').setVisible(value === 'custom')
        this.getSetting('padding').setVisible(value === 'custom')
        break
      }

      case 'alphabet': {
        // Alphabet characters are not allowed to be used as padding
        this.getSetting('padding').setBlacklistChars(value)
        break
      }
    }
  }

  /**
   * Returns the current variant options.
   * @return {object} Variant options
   */
  getVariantOptions () {
    const name = this.getSettingValue('variant')
    if (name === 'custom') {
      // Compose custom variant options
      const padding = this.getSettingValue('padding')
      return {
        alphabet: this.getSettingValue('alphabet'),
        padding: padding.getLength() === 1 ? padding.getCodePointAt(0) : null,
        decodeContentFilter: null,
        decodeMap: {}
      }
    }

    // Find variant options
    const options = variants.find(variant => variant.name === name)
    options.alphabet = Chain.wrap(options.alphabet)
    options.decodeMap = options.decodeMap || {}
    return options
  }
}
