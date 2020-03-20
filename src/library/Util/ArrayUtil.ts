
/**
 * Utility class providing static methods for common array operations.
 */
export default class ArrayUtil {
  /**
   * Deep comparison of two values.
   * @param a - Value a
   * @param b - Value b
   * @returns True, if equal
   */
  static isEqual (a: any, b: any): boolean {
    // Compare pointer (fastest)
    if (a === b) {
      return true
    }

    // Compare to null
    if (a === null && b === null) {
      return true
    } else if (a === null || b === null) {
      return false
    }

    // Compare types
    if (typeof a !== typeof b) {
      return false
    }

    // Compare arrays
    if (a instanceof Array) {
      // Compare array length
      if (a.length !== b.length) {
        return false
      }

      // Compare item by item
      let i = -1
      let equal = true
      while (equal && ++i < a.length) {
        equal = ArrayUtil.isEqual(a[i], b[i])
      }
      return equal
    }

    // Compare objects
    if (a instanceof Object) {
      // Check if an `isEqualTo` function is defined on the object (e.g. Chain)
      if (typeof a.isEqualTo === 'function') {
        return a.isEqualTo(b)
      }
      if (typeof b.isEqualTo === 'function') {
        return b.isEqualTo(a)
      }

      // Collect keys of both objects
      const keys = ArrayUtil.unique(Object.keys(a).concat(Object.keys(b)))

      // Compare value for each key
      let i = -1
      let equal = true
      while (equal && ++i < keys.length) {
        equal = ArrayUtil.isEqual(a[keys[i]], b[keys[i]])
      }
      return equal
    }

    // Compare date objects
    if (a instanceof Date) {
      return a.getTime() === b.getTime()
    }

    // Consider values are not equal
    return false
  }

  /**
   * Checks if an array only contains unique values (no duplicates).
   * @param array - Array to check on
   * @returns True, if array only contains unique values
   */
  static isUnique (array: any[]): boolean {
    return array.findIndex((e, i) => array.indexOf(e) !== i) === -1
  }

  /**
   * Removes duplicate values from an array.
   * @param array - Array to remove duplicates from
   * @returns New array with unique items
   */
  static unique (array: any[]): any[] {
    return array.filter((e, i) => array.indexOf(e) === i)
  }

  /**
   * Separates the given array into chunk slices of equal length.
   * @param array - Array to be separated
   * @param length - Length of one chunk slice
   * @returns Array of slices
   */
  static chunk (array: any[], length: number): any[] {
    const count = Math.ceil(array.length / length)
    const chunks = new Array(count)
    for (let i = 0; i < count; i++) {
      chunks[i] = array.slice(i * length, (i + 1) * length)
    }
    return chunks
  }

  /**
   * Joins the elements of the given array slices to an array, separated by
   * the given glue array.
   * @param slices - Array of array slices
   * @param glue - Glue array separating each slice
   * @returns Resulting array
   */
  static joinSlices (slices: any[], glue: any[] = []): any[] {
    const count = slices.length
    const glueLength = glue.length
    let array: any[] = []
    for (let i = 0; i < count; i++) {
      if (glueLength > 0 && i > 0) {
        array = array.concat(glue)
      }
      array = array.concat(slices[i])
    }
    return array
  }

  /**
   * Returns the index of the first occurrence of the given slice.
   * @param array - Haystack array
   * @param slice - Needle slice elements
   * @param fromIndex - Index at which to begin searching
   * @returns Index of the first slice occurance or -1 if there is none
   */
  static indexOfSlice (
    array: any[] | Uint8Array,
    slice: any[] | Uint8Array,
    fromIndex: number = 0
  ): number {
    if (slice.length === 0) {
      return -1
    }
    let i = -1
    let j = fromIndex - 1
    // Find the next occurrence of the first element
    while (i === -1 && (j = array.indexOf(slice[0], j + 1)) !== -1) {
      // Compare slice
      if (this.isEqual(array.slice(j, j + slice.length), slice)) {
        i = j
      }
    }
    return i
  }

  /**
   * Finds all occurences of the given slice inside a target array and replaces
   * them with the given replacement slice.
   * @param array - Target array
   * @param slice - Slice elements to be removed
   * @param replacement - Replacement slice
   * @returns Resulting array
   */
  static replaceSlice (
    array: any[],
    slice: any[],
    replacement: any[] = []
  ): any[] {
    let i = 0
    let j = -1
    let result: any[] = []
    // Find next occurence of the given slice
    while ((j = this.indexOfSlice(array, slice, j + 1)) !== -1) {
      // Append elements in between of the last and current slice
      result = result.concat(array.slice(i, j))
      // Append replacement elements
      result = result.concat(replacement)
      // Move the cursor behind the current slice
      i = j + slice.length
    }
    // Append the trailing array elements behind last slice
    result = result.concat(array.slice(i))
    return result
  }

  /**
   * Composes a new array with elements having the given number of bits and
   * translates the content of the source array to it.
   * @param src - Source array
   * @param srcSize - Bit size of source array elements
   * @param dstSize - Bit size of destination array elements
   * @param trimEnd - Wether to trim trailing empty elements
   * @returns Returns an array of numbers or an Uint8Array, if `dstSize` is
   * set to 8.
   */
  static resizeBitSizedArray(
    src: number[]|Uint8Array,
    srcSize: number,
    dstSize: number,
    trimEnd: boolean = false
  ): number[]|Uint8Array {
    const size = Math.ceil(src.length * srcSize / dstSize)
    const dst = dstSize === 8 ? new Uint8Array(size) : new Array(size).fill(0)

    // Destination element mask (e.g. 11111111b for dstSize = 8)
    const dstElementMask = (1 << dstSize) - 1

    let element, startBitIndex, endBitIndex, dstStartIndex, dstEndIndex
    let rightBitOffset, remainder, j

    for (let i = 0; i < src.length; i++) {
      element = src[i]

      // Start and end bit index of the current element
      startBitIndex = i * srcSize
      endBitIndex = (i + 1) * srcSize

      // Start and end index in the destination array
      dstStartIndex = Math.floor(startBitIndex / dstSize)
      dstEndIndex = Math.floor(endBitIndex / dstSize)

      // Calculate right bit offset in the last destination element
      rightBitOffset = dstSize - endBitIndex % dstSize

      // Begin at the end
      dst[dstEndIndex] |= (element << rightBitOffset) & dstElementMask
      remainder = element >> (dstSize - rightBitOffset)

      // Inject each dst element until no remainder is left
      j = dstEndIndex
      while (--j >= dstStartIndex && remainder > 0) {
        dst[j] |= remainder & dstElementMask
        remainder = remainder >> dstSize
      }
    }

    if (trimEnd) {
      // Trim trailing elements at the end
      let k = dst.length - 1
      while (dst[k] === 0) {
        k--
      }
      return dst.slice(0, k + 1)
    }

    return dst
  }
}
