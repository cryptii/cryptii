
import AffineCipherEncoder from './AffineCipher'

const meta = {
  name: 'caesar-cipher',
  title: 'Caesar Cipher',
  category: 'Simple Substitution',
  type: 'encoder'
}

const defaultShift = 7

/**
 * Encoder Brick for Caesar Cipher encoding and decoding.
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
      options: {
        integer: true,
        min: 1
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
        // changing the shift setting changes the hidden b setting
        this.setSettingValue('b', value)
        break
    }
    return super.settingValueDidChange(setting, value)
  }
}
