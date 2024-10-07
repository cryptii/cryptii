import ArrayUtil from '../ArrayUtil.js'
import PolybiusSquareEncoder from './PolybiusSquare.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'tap-code',
  title: 'Tap code',
  category: 'Polybius square ciphers',
  type: 'encoder'
}

/**
 * The tap code alphabet (without the letter K)
 * @type {string}
 */
const alphabet = 'abcdefghijlmnopqrstuvwxyz'

/**
 * Encoder brick for tap code encoding and decoding
 */
export default class TapCodeEncoder extends Encoder {
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
        name: 'tapMark',
        label: 'Tap',
        type: 'text',
        width: 4,
        value: '.',
        minLength: 1,
        randomizable: false
      },
      {
        name: 'groupMark',
        label: 'Group',
        type: 'text',
        width: 4,
        value: ' ',
        minLength: 1,
        randomizable: false
      },
      {
        name: 'letterMark',
        label: 'Letter',
        type: 'text',
        width: 4,
        value: '  ',
        minLength: 1,
        randomizable: false
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
    const tapMark = this.getSettingValue('tapMark').getString()
    const groupMark = this.getSettingValue('groupMark').getString()
    const letterMark = this.getSettingValue('letterMark').getString()

    // Encode content to coordinates using Polybius square
    // As C and K shares the same alphabet position, replace all K chars
    const coordinates = await this._polybiusSquare.encode(
      content.getString().replace(/k/gi, 'c'))

    const count = coordinates.getLength() / 2
    let row, column
    let result = ''

    // Translate each set of coordinates into tap marks
    for (let i = 0; i < count; i++) {
      row = parseInt(coordinates.getCharAt(i * 2))
      column = parseInt(coordinates.getCharAt(i * 2 + 1))

      result +=
        (i > 0 ? letterMark : '') +
        tapMark.repeat(row) +
        groupMark +
        tapMark.repeat(column)
    }

    return result
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    const tapMark = this.getSettingValue('tapMark').getCodePoints()
    const tapMarkLength = tapMark.length
    const input = content.getCodePoints()

    let coordinates = ''
    let i = 0
    let j = -1
    let value = 0

    // Iterate through tap marks
    while ((j = ArrayUtil.indexOfSlice(input, tapMark, j + 1)) !== -1) {
      // Check if the current dot is adjacent to the previous one
      if (i === 0 || j === i + tapMarkLength) {
        // Increase current coordinate value
        value++
      } else {
        // Append coordinate
        coordinates += value.toString()
        value = 1
      }

      i = j
    }

    // Append last coordinate
    coordinates += value.toString()

    // Decode coordinates using Polybius square
    return this._polybiusSquare.decode(coordinates)
  }
}
