
import AffineCipherEncoder from './AffineCipher'
import MathUtil from '../MathUtil'

const meta = {
  name: 'caesar-cipher',
  title: 'Caesar cipher',
  category: 'Substitution cipher',
  type: 'encoder'
}

const defaultShift = 7

/**
 * Encoder brick for Caesar Cipher encoding and decoding
 */
export default class CaesarCipherEncoder extends AffineCipherEncoder {
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

    // set a setting to 1 and hide it
    this.getSetting('a')
      .setValue(1)
      .setVisible(false)

    // set b setting to shift value and hide it
    this.getSetting('b')
      .setValue(defaultShift)
      .setVisible(false)

    // add shift setting
    this.registerSetting({
      name: 'caesarCipherShift',
      type: 'number',
      label: 'Shift',
      priority: 10,
      value: defaultShift,
      randomizeValue: this.randomizeShiftValue.bind(this),
      options: {
        integer: true
      }
    })
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
      case 'caesarCipherShift':
      case 'alphabet':
        const shiftSetting = this.getSetting('caesarCipherShift')
        const alphabetSetting = this.getSetting('alphabet')

        // needs valid alphabet and shift setting to set
        // affine cipher's b setting
        if (alphabetSetting.isValid() && shiftSetting.isValid()) {
          let shift = shiftSetting.getValue()

          // handle negative shift values
          const m = alphabetSetting.getValue().getLength()
          shift = MathUtil.mod(shift, m)

          // changing the shift setting changes the hidden b setting
          this.setSettingValue('b', shift)
        }
        break
    }
    return super.settingValueDidChange(setting, value)
  }

  /**
   * Generates a random shift setting value.
   * @protected
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
