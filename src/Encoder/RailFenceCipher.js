
import Encoder from '../Encoder'

const meta = {
  name: 'rail-fence-cipher',
  title: 'RailFence cipher',
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
        integer: true
      }
    ])
  }

  /**
     * Performs encode or decode on given content.
     * @param {Chain} content
     * @param {boolean} isEncode True for encoding, false for decoding
     * @return {number[]|string|Uint8Array|Chain} Resulting content
     */
  performTranslate (content, isEncode) {
    const { key } =
            this.getSettingValues()
    const n = content.getLength()
    const result = new Array(n)

    // create the matrix to cipher plain text
    // key = no. of rows in matrix
    const rail = new Array(key)
    for (let i = 0; i < key; i++) {
      rail[i] = new Array(n)
    }

    let dirDown = false
    let row = 0
    let col = 0

    if (isEncode) {
      // filling the rail matrix to distinguish
      // filled spaces from blank ones
      for (let i = 0; i < n; i++) {
        // check the direction of flow
        // reverse the direction if we've just
        // filled the top or bottom rail
        if (row === 0 || row === key - 1) {
          dirDown = !dirDown
        }

        // fill the corresponding alphabet
        rail[row][col] = content.getCodePointAt(i)

        col++

        // find the next row using direction flag
        if (dirDown) {
          row++
        } else {
          row--
        }
      }
      // construct the cipher using the rail matrix
      let index = 0
      for (let i = 0; i < key; i++) {
        for (let j = 0; j < n; j++) {
          if (rail[i][j]) {
            result[index] = rail[i][j]
            index++
          }
        }
      }
      return result
    }

    // decoder

    for (let i = 0; i < n; i++) {
      if (row === 0) {
        dirDown = true
      } else if (row === key - 1) {
        dirDown = false
      }
      // place the marker
      rail[row][col] = '*'
      col++

      // find the next row using direction flag
      if (dirDown) {
        row++
      } else {
        row--
      }
    }
    // construct the fill the rail matrix
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

    // read the matrix in zig-zag manner
    // to construct the plain text
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

  /**
     * Triggered when a setting field has changed.
     * @param {Field} setting Sender setting field
     * @param {mixed} value New field value
     */
  settingValueDidChange (setting, value) {
    switch (setting.getName()) {
      case 'key':
        // key cannot be less than 2
        if (value < 2) {
          setting.setValue(2)
        }
    }
  }
}
