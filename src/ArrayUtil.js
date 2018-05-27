
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
    random = random || new Random()
    const a = array.slice()
    let i, j
    for (i = a.length - 1; i > 0; i--) {
      j = random.nextInteger(0, i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
}
