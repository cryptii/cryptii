import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import InvalidInputError from '../Error/InvalidInput.js'
import MathUtil from '../MathUtil.js'
import PolybiusSquareEncoder from './PolybiusSquare.js'

const meta = {
  name: 'nihilist-cipher',
  title: 'Nihilist cipher',
  category: 'Polybius square ciphers',
  type: 'encoder'
}

/**
 * Default key
 * @type {string}
 */
const defaultKey = 'cryptii'

/**
 * Default alphabet (without J)
 * @type {string}
 */
const alphabet = 'abcdefghiklmnopqrstuvwxyz'

/**
 * Encoder brick for Nihilist cipher encryption and decryption
 */
export default class NihilistCipherEncoder extends Encoder {
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
        name: 'alphabet',
        type: 'text',
        value: alphabet,
        uniqueChars: true,
        minLength: 0,
        maxLength: 25,
        caseSensitivity: false
      },
      {
        name: 'key',
        type: 'text',
        value: defaultKey,
        whitelistChars: alphabet,
        minLength: 2,
        caseSensitivity: false
      },
      {
        name: 'separator',
        type: 'text',
        value: ' ',
        randomizable: false,
        blacklistChars: '0123456789',
        minLength: 1,
        caseSensitivity: false
      }
    ])

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
    const key = this.getSettingValue('key')
    const separator = this.getSettingValue('separator')

    // Translate both plaintext and key using the Polybius square
    const plaintextPolybius = await this._polybiusSquare.encode(
      content.getString().replace(/j/gi, 'i'))
    const keyPolybius = await this._polybiusSquare.encode(key)

    const contentLength = plaintextPolybius.getLength() / 2
    const keyLength = key.getLength()

    const values = new Array(contentLength)
    let plaintextValue, keyIndex, keyValue

    for (let i = 0; i < contentLength; i++) {
      // Compose plaintext number
      plaintextValue = parseInt(
        plaintextPolybius.getCharAt(i * 2) +
        plaintextPolybius.getCharAt(i * 2 + 1)
      )

      // Compose key number
      keyIndex = MathUtil.mod(i, keyLength) * 2
      keyValue = parseInt(
        keyPolybius.getCharAt(keyIndex) +
        keyPolybius.getCharAt(keyIndex + 1)
      )

      // Add plaintext and key values together
      values[i] = plaintextValue + keyValue
    }

    return Chain.join(values, separator)
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  async performDecode (content) {
    const key = this.getSettingValue('key')
    const separator = this.getSettingValue('separator')
    const values = content.getString().split(separator)

    const contentLength = values.length
    const keyLength = key.getLength()

    const keyPolybius = await this._polybiusSquare.encode(key)

    let value, plaintextValue, keyIndex, keyValue
    let plaintextPolybius = ''

    for (let i = 0; i < contentLength; i++) {
      // Read next value
      value = parseInt(values[i])
      if (isNaN(value)) {
        throw new InvalidInputError(
          `Block at index ${i + 1} is not a number.`)
      }

      // Compose key number
      keyIndex = MathUtil.mod(i, keyLength) * 2
      keyValue = parseInt(
        keyPolybius.getCharAt(keyIndex) +
        keyPolybius.getCharAt(keyIndex + 1)
      )

      // Compute plaintext number
      plaintextValue = value - keyValue
      if (!plaintextValue.toString().match(/^[1-5]{2}$/)) {
        throw new InvalidInputError(
          `Block at index ${i + 1} results in invalid ` +
          `Polybius square coordinates '${plaintextValue}'.`)
      }

      plaintextPolybius += plaintextValue.toString()
    }

    // Unwrap Polybius square encoded content
    return this._polybiusSquare.decode(plaintextPolybius)
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'alphabet': {
        // Create mixed alphabet
        const mixedAlphabet = value.extend(alphabet)
        this._polybiusSquare.setSettingValue('alphabet', mixedAlphabet)
        this.getSetting('key').setWhitelistChars(mixedAlphabet)
        break
      }
    }
  }
}
