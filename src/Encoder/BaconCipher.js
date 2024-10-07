import ArrayUtil from '../ArrayUtil.js'
import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import StringUtil from '../StringUtil.js'

const meta = {
  name: 'bacon-cipher',
  title: 'Bacon cipher',
  category: 'Ciphers',
  type: 'encoder'
}

/**
 * Array of variant specs
 * @type {object[]}
 */
const variantSpecs = [
  {
    name: 'original',
    label: 'Original',
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    codeAlphabet:
      'aaaaa' + 'aaaab' + 'aaaba' + 'aaabb' + 'aabaa' + 'aabab' + 'aabba' +
      'aabbb' + 'abaaa' + 'abaaa' + 'abaab' + 'ababa' + 'ababb' + 'abbaa' +
      'abbab' + 'abbba' + 'abbbb' + 'baaaa' + 'baaab' + 'baaba' + 'baabb' +
      'baabb' + 'babaa' + 'babab' + 'babba' + 'babbb'
  },
  {
    name: 'unique',
    label: 'Unique codes for each letter',
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
    codeAlphabet:
      'aaaaa' + 'aaaab' + 'aaaba' + 'aaabb' + 'aabaa' + 'aabab' + 'aabba' +
      'aabbb' + 'abaaa' + 'abaab' + 'ababa' + 'ababb' + 'abbaa' + 'abbab' +
      'abbba' + 'abbbb' + 'baaaa' + 'baaab' + 'baaba' + 'baabb' + 'babaa' +
      'babab' + 'babba' + 'babbb' + 'bbaaa' + 'bbaab'
  }
]

/**
 * Encoder brick for Bacon cipher encoding and decoding
 */
export default class BaconCipherEncoder extends Encoder {
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
        label: 'Variant',
        value: 'original',
        elements: variantSpecs.map(variant => variant.name),
        labels: variantSpecs.map(variant => variant.label),
        randomizable: false
      },
      {
        name: 'aMark',
        label: 'Letter 1',
        type: 'text',
        width: 6,
        value: 'a',
        minLength: 1,
        maxLength: 1,
        randomizable: false,
        validateValue: this.validateLetterSettingValue.bind(this)
      },
      {
        name: 'bMark',
        label: 'Letter 2',
        type: 'text',
        width: 6,
        value: 'b',
        minLength: 1,
        maxLength: 1,
        randomizable: false,
        validateValue: this.validateLetterSettingValue.bind(this)
      }
    ])
  }

  /**
   * Validates the letter setting value.
   * Makes sure they can be differentiated from each other.
   * @protected
   * @param {Chain} value
   * @param {Setting} setting
   * @return {boolean} Returns true, if value is valid.
   */
  validateLetterSettingValue (value, setting) {
    const altSetting =
      this.getSetting(setting.getName() === 'aMark' ? 'bMark' : 'aMark')
    return altSetting.isValid() && !value.isEqualTo(altSetting.getValue())
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Encoded content
   */
  performEncode (content) {
    const { alphabet, codes, codeLength } = this._getVariant()
    const aChar = this.getSettingValue('aMark').getCharAt(0)
    const bChar = this.getSettingValue('bMark').getCharAt(0)

    // Prepare content
    const lowercaseContent = content.toLowerCase()

    // Map input to alphabet codes
    let result = ''
    let codeIndex

    for (let i = 0; i < lowercaseContent.getLength(); i++) {
      codeIndex = alphabet.indexOf(lowercaseContent.getCharAt(i))
      if (codeIndex !== -1) {
        result += codes[codeIndex]
      }
    }

    // Map code marks, if not using the defaults
    if (aChar !== 'a' || bChar !== 'b') {
      result = result
        .split('')
        .map(mark => mark === 'a' ? aChar : bChar)
        .join('')
    }

    // Chunk codes separated by a whitespace
    return ArrayUtil.chunk(Chain.wrap(result).getChars(), codeLength)
      .map(slice => slice.join(''))
      .join(' ')
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    const { alphabet, codes, codeLength } = this._getVariant()
    const aCodePoint = this.getSettingValue('aMark').getCodePointAt(0)
    const bCodePoint = this.getSettingValue('bMark').getCodePointAt(0)

    // Translate content into known marks
    const inputCodePoints = content.getCodePoints()
    let inputMarks = ''
    let i

    for (i = 0; i < inputCodePoints.length; i++) {
      switch (inputCodePoints[i]) {
        case aCodePoint:
          inputMarks += 'a'
          break
        case bCodePoint:
          inputMarks += 'b'
          break
        default:
          // Ignore unknown mark
      }
    }

    // Group marks into code blocks
    const inputCodes = StringUtil.chunk(inputMarks, codeLength)

    // Map each code block to a letter using the alphabet
    let result = ''
    let codeIndex
    for (i = 0; i < inputCodes.length; i++) {
      codeIndex = codes.indexOf(inputCodes[i])
      if (codeIndex !== -1) {
        result += alphabet[codeIndex]
      }
    }

    return result
  }

  /**
   * Composes a spec for the currently selected variant.
   * @protected
   * @return {object}
   */
  _getVariant () {
    const variant = this.getSettingValue('variant')
    const { alphabet, codeAlphabet } =
      variantSpecs.find(spec => spec.name === variant)

    const codeLength = codeAlphabet.length / alphabet.length
    const codes = StringUtil.chunk(codeAlphabet, codeLength)

    return { alphabet, codes, codeLength }
  }
}
