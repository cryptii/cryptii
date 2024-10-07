import Random from './Random.js'

/**
 * Utility class providing static methods for common array operations.
 */
export default class ArrayUtil {
  /**
   * Deep comparison of two values.
   * @param {mixed} a
   * @param {mixed} b
   * @return {boolean} True, if equal
   */
  static isEqual (a, b) {
    // compare instance
    if (a === b) {
      return true
    }

    // check null
    if (a === null && b === null) {
      return true
    } else if (a === null || b === null) {
      return false
    }

    // check types
    if (typeof a !== typeof b) {
      return false
    }

    // compare arrays
    if (a instanceof Array) {
      if (a.length !== b.length) {
        return false
      }

      // compare item by item
      let i = -1
      let equal = true
      while (equal && ++i < a.length) {
        equal = ArrayUtil.isEqual(a[i], b[i])
      }
      return equal
    }

    // compare objects
    if (a instanceof Object) {
      // check if object knows how to compare itself to other objects
      if (typeof a.isEqualTo === 'function') {
        return a.isEqualTo(b)
      }
      if (typeof b.isEqualTo === 'function') {
        return b.isEqualTo(a)
      }

      // collect keys of objects
      const keys = ArrayUtil.unique(Object.keys(a).concat(Object.keys(b)))

      // compare items for each key
      let i = -1
      let equal = true
      while (equal && ++i < keys.length) {
        const comparingKey = keys[i]
        equal = ArrayUtil.isEqual(a[comparingKey], b[comparingKey])
      }
      return equal
    }

    // compare dates
    if (a instanceof Date) {
      return a.getTime() === b.getTime()
    }

    return false
  }

  /**
   * Checks if an array only contains unique values (no duplicates).
   * @param {array} array
   * @return {boolean} True, if array only contains unique values.
   */
  static isUnique (array) {
    return array.findIndex((element, index) =>
      array.indexOf(element) !== index) === -1
  }

  /**
   * Removes duplicate values from an array.
   * @param {array} array
   * @return {mixed} New array with unique items.
   */
  static unique (array) {
    return array.filter((element, index) => array.indexOf(element) === index)
  }

  /**
   * Orders array elements randomly using Fisher–Yates modern shuffle algorithm.
   * @param {array} array
   * @param {Random} [random] Random instance
   * @return {array} Shuffled array
   */
  static shuffle (array, random = null) {
    random = random || Random.getInstance()
    const a = array.slice()
    let i, j
    for (i = a.length - 1; i > 0; i--) {
      j = random.nextInteger(0, i)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  /**
   * Chunks the given array into slices of equal length.
   * @param {array} array Array to chunk
   * @param {number} length Length of one chunk
   * @return {array} Array of slices
   */
  static chunk (array, length) {
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
   * @param {array} slices Array of array slices
   * @param {array} glue Glue array separating each slice
   * @return {array} Array
   */
  static joinSlices (slices, glue = []) {
    const count = slices.length
    const glueLength = glue.length
    let array = []
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
   * @param {array} array Haystack
   * @param {array} slice Needle slice elements
   * @param {number} [fromIndex=0] Index at which to begin searching
   * @return {number} Index of the first slice occurance or -1 if there is none
   */
  static indexOfSlice (array, slice, fromIndex = 0) {
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
   * @param {array} array Target array
   * @param {array} slice Slice elements to be removed
   * @param {array} [replacement=[]] Replacement slice
   * @return {array} Resulting array
   */
  static replaceSlice (array, slice, replacement = []) {
    let i = 0
    let j = -1
    let result = []
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
   * @param {number[]} src Source array
   * @param {number} srcSize Bit size of source array elements
   * @param {number} dstSize Bit size of destination array elements
   * @param {boolean} [trimEnd=false] Wether to trim trailing empty elements
   * @return {number[]|Uint8Array} Returns an array of numbers or an
   * Uint8Array, if dstSize is set to 8.
   */
  static resizeBitSizedArray (src, srcSize, dstSize, trimEnd = false) {
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
