import Chain from '../Chain.js'
import Encoder from '../Encoder.js'

const meta = {
  name: 'trifid-cipher',
  title: 'Trifid cipher',
  category: 'Polybius square ciphers',
  type: 'encoder'
}

/**
 * The Trifid alphabet
 * @type {string}
 */
const baseAlphabet = 'abcdefghijklmnopqrstuvwxyz+'

/**
 * Encoder brick for Trifid cipher encryption and decryption
 */
export default class TrifidCipherEncoder extends Encoder {
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
        name: 'key',
        type: 'text',
        value: '',
        uniqueChars: true,
        minLength: 0,
        maxLength: 27,
        caseSensitivity: false
      },
      {
        name: 'groupSize',
        type: 'number',
        value: 5,
        min: 2
      }
    ])
  }

  /**
   * Performs encode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Encoded content
   */
  async performEncode (content) {
    const { key, groupSize } = this.getSettingValues()

    // Derive mixed-alphabet from key
    const alphabet = Chain.wrap(key).extend(baseAlphabet).getCodePoints()

    // Map Unicode code points to their respective alphabet positions
    const positions =
      content.toLowerCase().getCodePoints()
        .map(codePoint => alphabet.indexOf(codePoint))
        .filter(codePoint => codePoint !== -1)

    // Delastelle says: 'We start by writing vertically under each letter, the
    // numerical trigram that corresponds to it in the enciphering alphabet'
    // a i d e t   o i l e c
    // 1 1 1 1 2   3 1 1 1 2
    // 3 2 3 1 1   1 2 1 1 2
    // 1 1 3 2 2   1 1 3 2 1

    // Thus working with a one-dimensional array to represent the above table
    // we enumerate coordinates like this:
    // a  i  d  e  t    o  i  l  e  c
    // 01 02 03 04 05   21 22 23 24 25
    // 06 07 08 09 10   26 27 28 29 30
    // 11 12 13 14 15   31 32 33 34 35
    // 16 17 18 19 20   36 37 38 39 40
    const length = positions.length
    const table = new Array(length * 3)
    let i, j, coordinates, group, index, size

    for (i = 0; i < length; i++) {
      // Gather group number, character index inside group and group size, which
      // may be shorter for the last group
      group = Math.floor(i / groupSize)
      index = i - group * groupSize
      size = Math.min(groupSize, length - group * groupSize)

      // Position group coordinates vertically inside the one-dimensional table
      coordinates = this.cartesianCoordinatesFromIndex(positions[i])
      for (j = 0; j < 3; j++) {
        table[index + group * groupSize * 3 + size * j] = coordinates[j]
      }
    }

    // Following Delastelle: 'Proceeding horizontally as if the numbers were
    // written on a single line, we take groups of three numbers, look them up
    // in the deciphering alphabet'
    // Having built a one-dimensional array, we read 3-element cartesian
    // coordinates successively, translate them to one-dimensional indexes and
    // map each of them to the corresponding alphabet character
    const result = new Array(length)

    for (i = 0; i < length; i++) {
      coordinates = table.slice(i * 3, (i + 1) * 3)
      index = this.indexFromCartesianCoordinates(coordinates)
      result[i] = alphabet[index]
    }

    return result
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  async performDecode (content) {
    const { key, groupSize } = this.getSettingValues()

    // Derive mixed-alphabet from key
    const alphabet = Chain.wrap(key).extend(baseAlphabet).getCodePoints()

    // Map Unicode code points to their respective alphabet positions
    const positions =
      content.toLowerCase().getCodePoints()
        .map(codePoint => alphabet.indexOf(codePoint))
        .filter(codePoint => codePoint !== -1)

    // Fill in table horizontally
    // Refer to the `performEncode` method for more detailed explanations
    const length = positions.length
    const table = new Array(length * 3)
    let i, j, coordinates

    for (i = 0; i < length; i++) {
      coordinates = this.cartesianCoordinatesFromIndex(positions[i])
      for (j = 0; j < 3; j++) {
        table[i * 3 + j] = coordinates[j]
      }
    }

    // Read trigrams vertically for each character
    const result = new Array(length)
    let group, index, size

    for (i = 0; i < length; i++) {
      // Gather group facts
      group = Math.floor(i / groupSize)
      index = i - group * groupSize
      size = Math.min(groupSize, length - group * groupSize)

      // Read one character from vertical trigram
      for (j = 0; j < 3; j++) {
        coordinates[j] = table[index + group * groupSize * 3 + size * j]
      }

      index = this.indexFromCartesianCoordinates(coordinates)
      result[i] = alphabet[index]
    }

    return result
  }

  /**
   * Translates a one-dimensional index to three-dimensional cartesian
   * coordinates for a 3×3×3 cube.
   * @protected
   * @param {number} index Index
   * @return {number[]} Cartesian coordinate positions (x, y, z)
   */
  cartesianCoordinatesFromIndex (index) {
    const x = Math.floor(index / 9)
    const y = Math.floor((index - x * 9) / 3)
    const z = index - x * 9 - y * 3
    return [x + 1, y + 1, z + 1]
  }

  /**
   * Translates three-dimensional cartesian coordinates to a one-dimensional
   * index for a 3×3×3 cube.
   * @protected
   * @param {number[]} coordinates Cartesian coordinate positions (x, y, z)
   * @return {number} Index
   */
  indexFromCartesianCoordinates ([x, y, z]) {
    return (x - 1) * 9 + (y - 1) * 3 + (z - 1)
  }
}
