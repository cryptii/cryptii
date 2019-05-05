
import Random from './Random'

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
        let comparingKey = keys[i]
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
   * Removes all occurences of the given slice from the given array.
   * @param {array} array Target array
   * @param {array} slice Slice elements to be removed
   * @return {array} Resulting array
   */
  static removeSlice (array, slice) {
    let i = 0
    let j = -1
    let result = []
    // Find next occurence of the given slice
    while ((j = this.indexOfSlice(array, slice, j + 1)) !== -1) {
      // Append elements in between of the last and current slice
      result = result.concat(array.slice(i, j))
      // Move the cursor behind the current slice
      i = j + slice.length
    }
    // Append the trailing array elements behind last slice
    result = result.concat(array.slice(i))
    return result
  }
}
