import Encoder from '../Encoder.js'

const meta = {
  name: 'rail-fence-cipher',
  title: 'Rail fence cipher',
  category: 'Ciphers',
  type: 'encoder'
}

/**
 * Encoder brick for Rail fence cipher encoding and decoding
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
        value: 2,
        integer: true,
        min: 2,
        max: 99,
        // Pick a random key between 2 and 8
        randomizeValue: random => random.nextInteger(2, 8)
      },
      {
        name: 'offset',
        type: 'number',
        value: 0,
        integer: true,
        min: 0,
        randomizable: false
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
    const { key: rows, offset } = this.getSettingValues()
    const length = content.getLength()

    // Cycle after which fence matrix repeats
    const cycle = rows * 2 - 2

    // Prepare an empty string for each row
    const fenceRows = new Array(rows).fill('')

    // X -->
    //   W     I     R     E     E
    // Y  E   D S   E E   E A   C
    // |   A E   C V   D L   T N
    // V    R     O     F     O
    let x, y

    // Go through plaintext characters
    for (x = 0; x < length; x++) {
      // Calculate at what y position the fence is for the current x position
      y = rows - 1 - Math.abs(cycle / 2 - (x + offset) % cycle)
      // Append the the current plaintext character to the respective fence row
      fenceRows[y] += content.getCharAt(x)
    }

    // Glue fence rows together
    return fenceRows.join('')
  }

  /**
   * Performs decode on given content.
   * @protected
   * @param {Chain} content
   * @return {number[]|string|Uint8Array|Chain} Decoded content
   */
  performDecode (content) {
    const { key: rows, offset } = this.getSettingValues()
    const length = content.getLength()

    // Cycle after which fence matrix repeats
    const cycle = rows * 2 - 2

    // Create result array of code points
    const result = new Array(length)

    let j = -1
    let x, y

    // Go through virtual matrix rows (y) and cols (x)
    for (y = 0; y < rows; y++) {
      for (x = 0; x < length; x++) {
        // Check if the current x-y-position is situated on the zigzag fence
        if ((y + x + offset) % cycle === 0 || (y - x - offset) % cycle === 0) {
          // Set result for the current x-position
          result[x] = content.getCodePointAt(++j)
        }
      }
    }

    return result
  }
}
