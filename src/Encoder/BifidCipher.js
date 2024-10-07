import PolybiusSquareEncoder from './PolybiusSquare.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'bifid-cipher',
  title: 'Bifid cipher',
  category: 'Polybius square ciphers',
  type: 'encoder'
}

/**
 * The Bifid alphabet (without the letter J)
 * @type {string}
 */
const alphabet = 'abcdefghiklmnopqrstuvwxyz'

/**
 * Encoder brick for Bifid cipher encryption and decryption
 */
export default class BifidCipherEncoder extends Encoder {
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
      name: 'key',
      type: 'text',
      value: '',
      uniqueChars: true,
      minLength: 0,
      caseSensitivity: false
    })

    // Create internal Polybius square encoder instance
    this._polybiusSquare = new PolybiusSquareEncoder()
    this._polybiusSquare.setSettingValues({
      alphabet,
      rows: '12345',
      columns: '12345',
      separator: '',
      caseSensitivity: false,
      includeForeignChars: false
    })
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Encoded content
   */
  async performEncode (content) {
    // Encode content to coordinates using Polybius square
    // As I and J shares the same alphabet position, replace all J chars
    const sourcePolybius = await this._polybiusSquare.encode(
      content.getString().replace(/j/gi, 'i'))

    // Transpose coordinates such that the first coordinates (X) appear
    // combined before the second coordinates (Y)
    const polybiusLength = sourcePolybius.getLength()
    const resultPolybius = new Array(polybiusLength)
    for (let i = 0; i < polybiusLength / 2; i++) {
      resultPolybius[i] =
        sourcePolybius.getCodePointAt(i * 2)
      resultPolybius[polybiusLength / 2 + i] =
        sourcePolybius.getCodePointAt(i * 2 + 1)
    }

    return this._polybiusSquare.decode(resultPolybius)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  async performDecode (content) {
    const sourcePolybius = await this._polybiusSquare.encode(content)
    const polybiusLength = sourcePolybius.getLength()

    // Transpose coordinates back
    const resultPolybius = new Array(polybiusLength)
    for (let i = 0; i < polybiusLength / 2; i++) {
      resultPolybius[i * 2] =
        sourcePolybius.getCodePointAt(i)
      resultPolybius[i * 2 + 1] =
        sourcePolybius.getCodePointAt(polybiusLength / 2 + i)
    }

    return this._polybiusSquare.decode(resultPolybius)
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'key':
        // Derive Polybius square alphabet from the key setting
        this._polybiusSquare.setSettingValue('alphabet', value.extend(alphabet))
        break
    }
  }
}
