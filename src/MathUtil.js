
/**
 * Utility class providing static methods for common math operations.
 */
export default class MathUtil {
  /**
   * Custom modulo function always returning positive values.
   * @see http://stackoverflow.com/questions/1082917
   * @param {number} x
   * @param {number} m
   * @return {number}
   */
  static mod (x, m) {
    m = m < 0 ? -m : m
    let r = x % m
    return (r < 0 ? r + m : r)
  }

  /**
   * Integer division (a \ b).
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
      let h = a % b
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
      let [x, y, d] = MathUtil.xgcd(b, a % b)
      return [y, x - y * MathUtil.div(a, b), d]
    }
  }

  /**
   * Returns current timestamp.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
   * @return {float}
   */
  static time () {
    if (typeof window !== 'undefined') {
      return window.performance.now()
    }
    return parseFloat(new Date().getTime())
  }
}
