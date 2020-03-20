
/**
 * Utility class providing static methods for translations between strings and
 * arrays of Unicode code points.
 */
export default class UnicodeEncoder {
  /**
   * Validates a single Unicode code point.
   * @param codePoint - Unicode code point
   * @returns True, if valid
   */
  static validateCodePoint (codePoint: number): boolean {
    return (
      isFinite(codePoint) &&
      codePoint >= 0 &&
      codePoint <= 0x10FFFF &&
      Math.floor(codePoint) === codePoint
    )
  }

  /**
   * Validates the given array of Unicode code points.
   * @param codePoints - Unicode code points
   * @returns True, if valid
   */
  static validateCodePoints (codePoints: number[]): boolean {
    return codePoints.find(n => !this.validateCodePoint(n)) === undefined
  }

  /**
   * Returns a string containing as many code units as necessary
   * to represent the Unicode code points given by the first argument.
   * See: {@link http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/}
   * @param codePoints - Array of Unicode code points
   * @returns String (UCS-2)
   */
  static stringFromCodePoints (codePoints: number[]): string {
    // In the worst case every code point needs to be translated to two
    // surrogates each
    // Create a fixed size array that gets sliced at the end
    const codeUnits = new Array(codePoints.length * 2)
    let j = 0
    let codePoint

    for (let i = 0; i < codePoints.length; i++) {
      codePoint = codePoints[i]
      if (codePoint < 0x10000) {
        // Basic Multilingual Plane (BMP) character
        codeUnits[j++] = String.fromCharCode(codePoint)
      } else {
        // Character with surrogates
        codePoint -= 0x10000
        codeUnits[j++] = String.fromCharCode((codePoint >> 10) + 0xD800)
        codeUnits[j++] = String.fromCharCode((codePoint % 0x400) + 0xDC00)
      }
    }

    // Slice the fixed size array to the portion actually in use and concatenate
    // it to a string
    return codeUnits.slice(0, j).join('')
  }

  /**
   * Creates an array containing the numeric code points of each Unicode
   * character in the string. While JavaScript uses UCS-2 internally,
   * this function will convert a pair of surrogate halves (each of which
   * UCS-2 exposes as separate characters) into a single code point,
   * matching UTF-16. See: {@link https://github.com/bestiejs/punycode.js}
   * @param string - String (UCS-2)
   * @returns Array of Unicode code points
   */
  static codePointsFromString (string: string): number[] {
    // In the worst case every string code unit needs to be translated to
    // a single code point each
    // Create a fixed size array that gets sliced at the end
    const length = string.length
    const codePoints = new Array(length)

    let codeUnit, nextCodeUnit
    let j = 0
    let i = 0

    while (i < length) {
      codeUnit = string.charCodeAt(i++)

      if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF && i < length) {
        // Identified a high surrogate
        nextCodeUnit = string.charCodeAt(i++)

        // There is a next character
        if ((nextCodeUnit & 0xFC00) === 0xDC00) {
          // Low surrogate
          codePoints[j++] =
            ((codeUnit & 0x3FF) << 10) +
            (nextCodeUnit & 0x3FF) +
            0x10000
        } else {
          // Unmatched surrogate; Only append this code unit, in case
          // the next code unit is the high surrogate of a surrogate pair
          codePoints[j++] = codeUnit
          i--
        }
      } else {
        // Identified BMP character
        codePoints[j++] = codeUnit
      }
    }

    // Slice the fixed size array to the portion actually in use
    return codePoints.slice(0, j)
  }
}
