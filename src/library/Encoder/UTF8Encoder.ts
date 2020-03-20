
import EncoderError from './EncoderError'

/**
 * Utility class providing static methods for UTF-8 encoding and decoding.
 */
export default class UTF8Encoder {
  /**
   * UTF-8 encodes the given array of Unicode code points to bytes.
   * @param codePoints - Unicode code points
   * @returns UTF-8 encoded array of bytes
   */
  static bytesFromCodePoints (codePoints: number[]): Uint8Array {
    // In the worst case every code point needs to be represented by 4 bytes
    // Create a fixed size array that gets sliced at the end
    const bytes = new Uint8Array(codePoints.length * 4)
    let j = 0
    let codePoint

    for (let i = 0; i < codePoints.length; i++) {
      codePoint = codePoints[i]

      if (codePoint <= 0x7F) {
        // 1 byte: 0xxxxxxx
        bytes[j++] = codePoint
      } else if (codePoint <= 0x7FF) {
        // 2 bytes: 110xxxxx 10xxxxxx
        bytes[j++] = 0b11000000 | (codePoint >> 6)
        bytes[j++] = 0b10000000 | (codePoint & 0x3F)
      } else if (codePoint <= 0xFFFF) {
        // 3 bytes: 1110xxxx 10xxxxxx 10xxxxxx
        bytes[j++] = 0b11100000 | (codePoint >> 12)
        bytes[j++] = 0b10000000 | ((codePoint & 0xFFF) >> 6)
        bytes[j++] = 0b10000000 | (codePoint & 0x3F)
      } else {
        // 4 bytes: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
        bytes[j++] = 0b11110000 | (codePoint >> 18)
        bytes[j++] = 0b10000000 | ((codePoint & 0x3FFFF) >> 12)
        bytes[j++] = 0b10000000 | ((codePoint & 0xFFF) >> 6)
        bytes[j++] = 0b10000000 | (codePoint & 0x3F)
      }
    }

    // Slice the fixed size array to the portion actually in use
    return bytes.slice(0, j)
  }

  /**
   * UTF-8 decodes an array of Unicode code points from the given bytes.
   * @param bytes - Array of bytes
   * @throws If the given binary data is not valid UTF-8
   * @returns Array of Unicode code points
   */
  static codePointsFromBytes (bytes: Uint8Array): number[] {
    // In the worst case byte needs to be represented by one code point
    // Create a fixed size array that gets sliced at the end
    const size = bytes.length
    const codePoints = new Array(size)

    let remainingBytes = 0
    let i = -1
    let j = 0
    let codePoint = 0
    let byte

    while (++i < size) {
      byte = bytes[i]

      if (byte > 0b01111111 && byte <= 0b10111111) {
        // Continuation byte identified
        if (--remainingBytes < 0) {
          throw new EncoderError(
            `Invalid UTF-8 encoded text: ` +
            `Unexpected continuation byte at 0x${i.toString(16)}`, i)
        }

        // Append bits to current code point
        codePoint = (codePoint << 6) | (byte & 0x3F)

        if (remainingBytes === 0) {
          // Completed a code point
          codePoints[j++] = codePoint
        }
      } else if (remainingBytes > 0) {
        // This must be a continuation byte
        throw new EncoderError(
          `Invalid UTF-8 encoded text: ` +
          `Continuation byte expected at 0x${i.toString(16)}`, i)
      } else if (byte <= 0b01111111) {
        // 1 byte code point
        codePoints[j++] = byte
      } else if (byte <= 0b11011111) {
        // 2 byte code point
        codePoint = byte & 0b00011111
        remainingBytes = 1
      } else if (byte <= 0b11101111) {
        // 3 byte code point
        codePoint = byte & 0b00001111
        remainingBytes = 2
      } else if (byte <= 0b11110111) {
        // 4 byte code point
        codePoint = byte & 0b00000111
        remainingBytes = 3
      } else {
        throw new EncoderError(
          `Invalid UTF-8 encoded text: ` +
          `Invalid byte ${byte} at 0x${i.toString(16)}`, i)
      }
    }

    if (remainingBytes !== 0) {
      throw new EncoderError(
        `Invalid UTF-8 encoded text: Unexpected end of bytes`)
    }

    // Slice the fixed size array to the portion actually in use
    return codePoints.slice(0, j)
  }
}
