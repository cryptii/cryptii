
import MathUtil from '../MathUtil'
import SimpleSubstitutionEncoder from './SimpleSubstitution'

const meta = {
  name: 'vigenere-cipher',
  title: 'Vigenère cipher',
  category: 'Simple Substitution',
  type: 'encoder'
}

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'

/**
 * Encoder Brick for Vigenère cipher encoding and decoding.
 */
export default class VigenereCipherEncoder extends SimpleSubstitutionEncoder {
  /**
   * Returns brick meta.
   * @return {object}
   */
  static getMeta () {
    return meta
  }

  /**
   * Encoder constructor
   */
  constructor () {
    super()

    this.registerSetting([
      {
        name: 'key',
        type: 'text',
        value: 'cryptii',
        options: {
          allowedChars: defaultAlphabet,
          minLength: 2
        }
      },
      {
        name: 'alphabet',
        type: 'alphabet',
        value: defaultAlphabet,
        randomizable: false
      },
      {
        name: 'caseSensitivity',
        type: 'boolean',
        width: 6,
        value: false,
        randomizable: false
      },
      {
        name: 'includeForeignChars',
        type: 'boolean',
        label: 'Foreign Chars',
        width: 6,
        value: true,
        randomizable: false,
        options: {
          trueLabel: 'Include',
          falseLabel: 'Ignore'
        }
      }
    ])
  }

  /**
   * Triggered before performing encode or decode on given content.
   * @protected
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding.
   * @return {Chain} Filtered content
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
    let alphabet = this.getSettingValue('alphabet')
    let charIndex = alphabet.indexOfCodePoint(codePoint)

    if (charIndex === -1) {
      // characters not in alphabet
      if (!this.getSettingValue('includeForeignChars')) {
        // return null character
        return 0
      } else {
        // leave it unchanged
        return codePoint
      }
    }

    // get key code point for this character index
    let key = this.getSettingValue('key')
    let keyIndex = MathUtil.mod(index, key.getLength())
    let keyCodePoint = key.getCodePointAt(keyIndex)

    // determine shift by position in alphabet and inverse it if decoding
    let shift = alphabet.indexOfCodePoint(keyCodePoint) * (isEncode ? 1 : -1)

    // shift character index
    charIndex = MathUtil.mod(charIndex + shift, alphabet.getLength())
    return alphabet.getCodePointAt(charIndex)
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
        // update allowed chars of key setting
        this.getSetting('key').setAllowedChars(value)
        break
      case 'caseSensitivity':
        // also set case sensitivity on alphabet and key setting
        this.getSetting('alphabet').setCaseSensitivity(value)
        this.getSetting('key').setCaseSensitivity(value)
        break
    }
    return super.settingValueDidChange(setting, value)
  }
}
