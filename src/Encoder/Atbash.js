
import AffineCipherEncoder from './AffineCipher'
import Chain from '../Chain'
import Encoder from '../Encoder'

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
export default class AtbashEncoder extends Encoder {
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
      name: 'alphabet',
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

    // Define internal affine cipher
    this._affineCipher = new AffineCipherEncoder()
    this._affineCipher.setSettingValues({
      alphabet: latinAlphabet,
      a: latinAlphabet.getLength() - 1,
      b: latinAlphabet.getLength() - 1
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
   * @protected
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet':
        const alphabet = value === 'latin' ? latinAlphabet : hebrewAlphabet
        this._affineCipher.setSettingValues({
          alphabet,
          a: alphabet.getLength() - 1,
          b: alphabet.getLength() - 1
        })
    }
    super.settingValueDidChange(setting, value)
  }
}
