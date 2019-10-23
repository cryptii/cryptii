
import Encoder from '../Encoder'

const meta = {
  name: 'rail-fence-cipher',
  title: 'Rail fence cipher',
  category: 'Ciphers',
  type: 'encoder'
}

const defaultKey = 2

/**
 * Encoder brick for RailFence Cipher encoding and decoding
 */
export default class RailFenceCipherEncoder extends Encoder {
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
        type: 'number',
        label: 'Key',
        priority: 10,
        value: defaultKey,
        integer: true,
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
  performEncode (content) {
    const { key } =
            this.getSettingValues()
    const n = content.getLength()
    const result = new Array(n)

    // Create the rail matrix
    // Here, key = number of rows in the matrix
    const rail = new Array(key)
    for (let i = 0; i < key; i++) {
      rail[i] = new Array(n)
    }

    let dirDown = false
    let row = 0
    let col = 0

    // Filling the rail matrix to distinguish filled spaces from blank ones
    for (let i = 0; i < n; i++) {
      // Reverse the direction if we've just filled the top or bottom rail
      if (row === 0 || row === key - 1) {
        dirDown = !dirDown
      }

      // Fill the corresponding alphabet
      rail[row][col] = content.getCodePointAt(i)

      col++

      // Find the next row using direction flag
      if (dirDown) {
        row++
      } else {
        row--
      }
    }
    // Construct the cipher using the rail matrix
    let index = 0
    for (let i = 0; i < key; i++) {
      for (let j = 0; j < n; j++) {
        if (rail[i][j] !== undefined) {
          result[index] = rail[i][j]
          index++
        }
      }
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
    const { key } =
        this.getSettingValues()
    const n = content.getLength()
    const result = new Array(n)

    // Create the rail matrix
    // Here, key = number of rows in the matrix
    const rail = new Array(key)
    for (let i = 0; i < key; i++) {
      rail[i] = new Array(n)
    }

    let dirDown = false
    let row = 0
    let col = 0

    for (let i = 0; i < n; i++) {
      if (row === 0) {
        dirDown = true
      } else if (row === key - 1) {
        dirDown = false
      }
      // Place the marker
      rail[row][col] = '*'
      col++

      // Find the next row using direction flag
      if (dirDown) {
        row++
      } else {
        row--
      }
    }
    // Construct the fill the rail matrix
    let index = 0
    for (let i = 0; i < key; i++) {
      for (let j = 0; j < n; j++) {
        if (rail[i][j] === '*' && index < n) {
          rail[i][j] = content.getCodePointAt(index)
          index++
        }
      }
    }

    index = 0
    row = 0
    col = 0

    // Read the matrix in zig-zag manner to construct the plain text
    for (let i = 0; i < n; i++) {
      if (row === 0) {
        dirDown = true
      } else if (row === key - 1) {
        dirDown = false
      }

      if (rail[row][col] !== '*') {
        result[index] = rail[row][col]
        index++
        col++
      }
      if (dirDown) {
        row++
      } else {
        row--
      }
    }

    return result
  }
}
