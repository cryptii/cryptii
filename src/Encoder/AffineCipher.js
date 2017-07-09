
import Chain from '../Chain'
import MathUtil from '../MathUtil'
import SimpleSubstitutionEncoder from './SimpleSubstitution'

const defaultAlphabet = new Chain('abcdefghijklmnopqrstuvwxyz')

/**
 * Encoder Brick for Affine Cipher encoding and decoding.
 */
export default class AffineCipherEncoder extends SimpleSubstitutionEncoder {
  /**
   * Brick constructor
   */
  constructor () {
    super()

    // linear function
    // f(x) = ax + b

    this.registerSetting([
      {
        name: 'a',
        type: 'number',
        value: 5,
        validateValue: this.validateSlopeValue.bind(this),
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'b',
        type: 'number',
        value: 8,
        options: {
          integer: true,
          min: 1
        }
      },
      {
        name: 'alphabet',
        type: 'text',
        value: defaultAlphabet
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        value: true
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        value: true
      }
    ])
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @protected
   * @param {string} content
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @return {string} Filtered content
   */
  willTranslate (content, isEncode) {
    return !this.getSettingValue('caseSensitivity')
      ? content.toLowerCase()
      : content
  }

  /**
   * Performs encode or decode on given character, index and content.
   * @protected
   * @param {number} codePoint Unicode code point
   * @param {number} index Unicode code point index inside content.
   * @param {Chain} content Content to be translated.
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @return {number} Resulting Unicode code point
   */
  performCharTranslate (codePoint, index, content, isEncode) {
    let a = this.getSettingValue('a')
    let b = this.getSettingValue('b')
    let alphabet = this.getSettingValue('alphabet')
    let m = alphabet.getLength()
    let x = alphabet.indexOfCodePoint(codePoint)

    if (x === -1) {
      // character not in alphabet
      if (!this.getSettingValue('includeForeignChars')) {
        // return null character
        return 0
      } else {
        // leave it unchanged
        return codePoint
      }
    }

    let y

    if (isEncode) {
      // E(x) = (ax + b) mod m
      y = MathUtil.pmod(a * x + b, m)
    } else {
      // D(x) = (a^-1(x - b)) mod m
      let [c] = MathUtil.xgcd(a, m)
      y = MathUtil.pmod(c * (x - b), m)
    }

    return alphabet.getCodePointAt(y)
  }

  /**
   * Triggered when a setting value has changed.
   * @protected
   * @param {Setting} setting
   * @param {mixed} value Setting value
   * @return {Encoder} Fluent interface
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        // changing the alphabet setting value can invalidate the slope setting
        this.getSetting('a').revalidateValue()
        break
      case 'caseSensitivity':
        // also set case sensitivity on the alphabet setting
        this.getSetting('alphabet').setCaseSensitivity(value)
        break
    }
    return super.settingValueDidChange(setting)
  }

  /**
   * Validates slope (a) setting value.
   * @param {number} a
   * @return {boolean}
   */
  validateSlopeValue (a) {
    // the value a must be chosen such that a and m are coprime.
    let m = this.getSettingValue('alphabet').getLength()
    return MathUtil.isCoprime(a, m)
  }
}
