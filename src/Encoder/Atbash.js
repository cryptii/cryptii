
import AffineCipherEncoder from './AffineCipher'
import Chain from '../Chain'

const meta = {
  name: 'atbash',
  title: 'Atbash',
  category: 'Substitution cipher',
  type: 'encoder'
}

const latinAlphabet = Chain.wrap('abcdefghijklmnopqrstuvwxyz')
const hebrewAlphabet = Chain.wrap('תשרקצפעסנמלכיטחזוהדגבא')

/**
 * Encoder brick for Atbash encoding and decoding
 */
export default class AtbashEncoder extends AffineCipherEncoder {
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

    // add variant setting
    this.registerSetting({
      name: 'atbashAlphabet',
      type: 'enum',
      label: 'Alphabet',
      priority: 10,
      value: 'latin',
      randomizable: false,
      options: {
        elements: [
          'latin',
          'hebrew'
        ],
        labels: [
          'Latin alphabet',
          'Hebrew alphabet'
        ]
      }
    })

    // make some settings private
    this.getSetting('a').setVisible(false)
    this.getSetting('b').setVisible(false)
    this.getSetting('caseSensitivity').setVisible(false)
    this.getSetting('includeForeignChars').setVisible(false)
    this.getSetting('alphabet').setVisible(false)

    // apply default alphabet
    this.getSetting('alphabet').setValue(latinAlphabet)

    // apply inital encryption function
    this.applyEncryptionFunctionByAlphabet(latinAlphabet)
  }

  /**
   * Returns wether this brick is randomizable.
   * @return {boolean}
   */
  isRandomizable () {
    return false
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
      case 'atbashAlphabet':
        // this causes changes to the alphabet setting
        return this.setSettingValue('alphabet',
          value === 'latin' ? latinAlphabet : hebrewAlphabet)
      case 'alphabet':
        // this causes changes to settings a and b
        this.applyEncryptionFunctionByAlphabet(value)
        break
    }
    return super.settingValueDidChange(setting, value)
  }

  /**
   * Applies affine cipher function by given alphabet.
   * @protected
   * @param {Chain} alphabet
   * @return {Atbash} Fluent interface
   */
  applyEncryptionFunctionByAlphabet (alphabet) {
    const m = alphabet.getLength()
    this.setSettingValue('a', m - 1)
    this.setSettingValue('b', m - 1)
    return this
  }
}
