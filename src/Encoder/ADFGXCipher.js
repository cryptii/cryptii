import ArrayUtil from '../ArrayUtil.js'
import Chain from '../Chain.js'
import Encoder from '../Encoder.js'
import PolybiusSquareEncoder from './PolybiusSquare.js'

const meta = {
  name: 'adfgx-cipher',
  title: 'ADFGX cipher',
  category: 'Polybius square ciphers',
  type: 'encoder'
}

/**
 * Default variant name.
 * @type {string}
 */
const defaultVariantName = 'adfgx'

/**
 * Array of ADFGVX variants.
 * @type {object[]}
 */
const variants = [
  {
    name: 'adfgx',
    label: 'ADFGX',
    squarePositions: 'adfgx',
    // Reversed base alphabet without the letter J
    alphabet: 'zyxwvutsrqponmlkihgfedcba'
  },
  {
    name: 'adfgvx',
    label: 'ADFGVX',
    squarePositions: 'adfgvx',
    // Reverse base alphabet including the letter J and numbers 0-9
    alphabet: '9876543210zyxwvutsrqponmlkjihgfedcba'
  }
]

/**
 * Alphabet (without the letter J)
 * @type {string}
 */
const alphabet = 'abcdefghiklmnopqrstuvwxyz'

/**
 * Encoder brick for ADFGVX cipher encryption and decryption
 */
export default class ADFGVXCipherEncoder extends Encoder {
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
        value: defaultVariantName,
        elements: variants.map(variant => variant.name),
        labels: variants.map(variant => variant.label),
        randomizable: false
      },
      {
        name: 'alphabet',
        type: 'text',
        value: alphabet,
        uniqueChars: true,
        blacklistChars: ' ',
        minLength: 0,
        maxLength: 25,
        caseSensitivity: false
      },
      {
        name: 'key',
        type: 'text',
        value: 'cargo',
        minLength: 2,
        maxLength: 24,
        caseSensitivity: false
      }
    ])

    // Create internal Polybius square encoder instance
    const variant = this.constructor.getVariant(defaultVariantName)
    this._polybiusSquare = new PolybiusSquareEncoder()
    this._polybiusSquare.setSettingValues({
      alphabet,
      rows: variant.squarePositions,
      columns: variant.squarePositions,
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
    // Prepare content
    let contentString = content.getString()
    const variantName = this.getSettingValue('variant')
    if (variantName === 'adfgx') {
      // As I and J shares the same alphabet position, replace all J chars
      contentString = contentString.replace(/j/gi, 'i')
    }

    // Derive column map from key
    const key = this.getSettingValue('key')
    const keyLength = key.getLength()
    const columnMap = this.mapElementsToSortedPosition(key.getChars())

    // Encode content to coordinates using Polybius square
    const polybius = await this._polybiusSquare.encode(contentString)
    const polybiusLength = polybius.getLength()

    // Encode Polybius square coordinates using substitution and transposition
    const result = new Array(polybiusLength + keyLength)
    let i, column, row, index
    let j = 0

    for (i = 0; i < keyLength; i++) {
      // Derive column from key
      column = columnMap[i]

      // Go through each column row
      for (row = 0; row * keyLength + column < polybiusLength; row++) {
        // Translate 2D column and row coordintes to 1D index
        index = row * keyLength + column
        result[j++] = polybius.getCodePointAt(index)
      }
    }

    // Group result in pairs of 5 characters each, separated by a space
    return ArrayUtil.joinSlices(ArrayUtil.chunk(result.slice(0, j), 5), [32])
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    const variantName = this.getSettingValue('variant')
    const variant = this.constructor.getVariant(variantName)
    const squarePositions = Chain.wrap(variant.squarePositions).getCodePoints()

    // Prepare content by removing non-position characters
    const codePoints = content.getCodePoints()
      .filter(codePoint => squarePositions.indexOf(codePoint) !== -1)
    const length = codePoints.length

    // Derive column map from key
    const key = this.getSettingValue('key')
    const keyLength = key.getLength()
    const columnMap = this.mapElementsToSortedPosition(key.getChars())

    // Calculate the number of columns available in the last row as the
    // plaintext content may not have filled up the entire grid
    const lastRowColumns = (length % keyLength) || keyLength
    const rows = Math.ceil(length / keyLength)

    // Decode code points to Polybius square coordinates
    const polybius = new Array(length)
    let index = 0
    let i, column, row, columnRows

    // Go through columns
    for (i = 0; i < keyLength; i++) {
      column = columnMap[i]

      // The last row of this column may be empty
      columnRows = column >= lastRowColumns ? rows - 1 : rows

      // Transpose each column character
      for (row = 0; row < columnRows; row++) {
        polybius[row * keyLength + column] = codePoints[index++]
      }
    }

    // Decode coordinates using Polybius square
    return this._polybiusSquare.decode(polybius)
  }

  /**
   * Maps the given elements to their corresponding positions in a sorted array.
   * @protected
   * @param {array} elements Array of elements
   * @return {array} Array with the corresponding position for each element
   */
  mapElementsToSortedPosition (elements) {
    const length = elements.length
    const map = new Array(length)
    const from = elements.slice()
    const to = elements.slice().sort()
    let index

    for (let k = 0; k < length; k++) {
      index = from.indexOf(to[k])
      map[k] = index
      // Flag the element as claimed, with that duplicate elements are mapped to
      // different sorted positions
      delete from[index]
    }

    return map
  }

  /**
   * Triggered when a setting field has changed.
   * @param {Field} setting Sender setting field
   * @param {mixed} value New field value
   */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'variant': {
        // Configure the Polybius square according to the given variant
        const variant = this.constructor.getVariant(value)
        this._polybiusSquare.setSettingValues({
          rows: variant.squarePositions,
          columns: variant.squarePositions
        })

        // Update alphabet, if setting is valid
        const alphabetSetting = this.getSetting('alphabet')
        if (alphabetSetting.isValid()) {
          this._polybiusSquare.setSettingValue('alphabet',
            alphabetSetting.getValue().extend(variant.alphabet))
        }

        // Configure variant constraints
        this.getSetting('alphabet').setMaxLength(variant.alphabet.length)
        this.getSetting('key').setMaxLength(variant.alphabet.length - 1)
        break
      }

      case 'alphabet': {
        // Derive Polybius square mixed alphabet from the alphabet setting
        const variant = this.constructor.getVariant(
          this.getSettingValue('variant'))
        this._polybiusSquare.setSettingValue('alphabet',
          value.extend(variant.alphabet))
        break
      }
    }
  }

  /**
   * Returns a variant for the given name.
   * @protected
   * @param {string} name Variant name
   * @return {object|null} Variant object or null, if unknown
   */
  static getVariant (name) {
    return variants.find(variant => variant.name === name) || null
  }
}
