
import AffineCipherEncoder from './AffineCipher'
import Encoder from '../Encoder'
import MathUtil from '../MathUtil'

const meta = {
  name: 'caesar-cipher',
  title: 'Caesar cipher',
  category: 'Substitution cipher',
  type: 'encoder'
}

const defaultAlphabet = 'abcdefghijklmnopqrstuvwxyz'
const defaultShift = 7

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class CaesarCipherEncoder extends Encoder {
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
        name: 'shift',
        type: 'number',
        label: 'Shift',
        priority: 10,
        value: defaultShift,
        randomizeValue: this.randomizeShiftValue.bind(this),
        options: {
          integer: true
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

    // Define internal affine cipher
    this._affineCipher = new AffineCipherEncoder()
    this._affineCipher.setSettingValues({
      alphabet: defaultAlphabet,
      a: 1,
      b: defaultShift
    })
  }

  /**
   * Performs encode or decode on given content.
   * @param {Chain} content
   * @param {boolean} isEncode True for encoding, false for decoding
   * @return {number[]|string|Uint8Array|Chain|Promise} Resulting content
   */
  performTranslate (content, isEncode) {
    return this._affineCipher.translate(content, isEncode)
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
      case 'shift':
        const shiftSetting = this.getSetting('shift')
        const alphabetSetting = this.getSetting('alphabet')

        // Needs valid alphabet and shift setting to calculate
        // affine cipher's b setting
        if (alphabetSetting.isValid() && shiftSetting.isValid()) {
          const alphabet = alphabetSetting.getValue()

          // Handle negative shift values
          const shift = MathUtil.mod(
            shiftSetting.getValue(),
            alphabet.getLength())

          // Update settings of internal affine cipher
          this._affineCipher.setSettingValue('alphabet', alphabet)
          this._affineCipher.setSettingValue('b', shift)
        }
        break

      case 'caseSensitivity':
        this._affineCipher.setSettingValue('caseSensitivity', value)
        break

      case 'includeForeignChars':
        this._affineCipher.setSettingValue('includeForeignChars', value)
        break
    }
    super.settingValueDidChange(setting, value)
  }

  /**
   * Generates a random shift setting value.
   * @param {Random} random Random instance
   * @param {Setting} setting Plugboard setting
   * @return {string} Randomized plugboard setting value
   */
  randomizeShiftValue (random, setting) {
    const alphabetSetting = this.getSetting('alphabet')
    if (alphabetSetting.isValid()) {
      return random.nextInteger(1, alphabetSetting.getValue().getLength() - 1)
    }
    return null
  }
}
