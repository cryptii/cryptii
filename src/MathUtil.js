/**
 * Utility class providing static methods for common math operations.
 */
export default class MathUtil {
  /**
   * Custom modulo function always returning positive values.
   * @see http://stackoverflow.com/questions/1082917
   * @param {number|BigInt} x
   * @param {number|BigInt} m
   * @return {number|BigInt}
   */
  static mod (x, m) {
    m = m < 0 ? -m : m
    const r = x % m
    return (r < 0 ? r + m : r)
  }

  /**
   * Integer division (a / b)
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  static div (a, b) {
    return Math.floor(a / b)
  }

  /**
   * Returns wether two integers are coprime.
   * @param {number} a
   * @param {number} b
   * @return {boolean}
   */
  static isCoprime (a, b) {
    return MathUtil.gcd(a, b) === 1
  }

  /**
   * Applies the Euclidean algorithm for computing the greatest
   * common divisor of two integers.
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  static gcd (a, b) {
    while (b !== 0) {
      const h = a % b
      a = b
      b = h
    }
    return a
  }

  /**
   * Applies the extended Euclidean algorithm, which computes, besides the
   * greatest common divisor of integers a and b, the coefficients of Bézout's
   * identity, which are integers x and y such that ax + by = gcd(a, b).
   * @param {number} a
   * @param {number} b
   * @return {number[]} Returns [x, y, d] such that ax + by = gcd(a, b).
   */
  static xgcd (a, b) {
    if (b === 0) {
      return [1, 0, a]
    } else {
      const [x, y, d] = MathUtil.xgcd(b, a % b)
      return [y, x - y * MathUtil.div(a, b), d]
    }
  }

  /**
   * Returns the time elapsed since the time origin in ms.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
   * @see https://nodejs.org/api/process.html#process_process_hrtime_time
   * @return {float}
   */
  static time () {
    if (typeof window !== 'undefined' &&
        typeof window.performance !== 'undefined') {
      return window.performance.now()
    } else if (typeof process !== 'undefined') {
      return process.hrtime()[1] / 1e+6
    } else {
      return parseFloat(new Date().getTime())
    }
  }
}
