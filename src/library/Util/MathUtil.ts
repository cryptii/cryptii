
/**
 * Utility class providing static methods for common math operations.
 */
export default class MathUtil {
  /**
   * Custom modulo function always returning positive values.
   * See {@link http://stackoverflow.com/questions/1082917}
   * @param x
   * @param m
   * @returns Result
   */
  static mod (x: number, m: number): number {
    m = m < 0 ? -m : m
    const r = x % m
    return (r < 0 ? r + m : r)
  }

  /**
   * Applies the Euclidean algorithm for computing the greatest common divisor
   * of two integers a and b. a and b are coprime if the result is 1.
   * @param a
   * @param b
   * @returns Greatest common divisor
   */
  static gcd (a: number, b: number): number {
    let temp
    while (b !== 0) {
      temp = a % b
      a = b
      b = temp
    }
    return a
  }

  /**
   * Applies the extended Euclidean algorithm, which computes, besides the
   * greatest common divisor of integers a and b, the coefficients of Bézout's
   * identity, which are integers x and y such that ax + by = gcd(a, b).
   * @param a
   * @param b
   * @returns `[x, y, d]` such that ax + by = gcd(a, b).
   */
  static xgcd (a: number, b: number): number[] {
    if (b === 0) {
      return [1, 0, a]
    } else {
      const [x, y, d] = MathUtil.xgcd(b, a % b)
      return [y, x - y * Math.floor(a / b), d]
    }
  }

  /**
   * Returns the time elapsed since the time origin in ms.
   * See {@link https://developer.mozilla.org/en-US/docs/Web/API/Performance/now}
   * See {@link https://nodejs.org/api/process.html#process_process_hrtime_time}
   * @returns Time elapsed since the time origin in ms
   */
  static time (): number {
    if (typeof window !== 'undefined' &&
        typeof window.performance !== 'undefined') {
      return window.performance.now()
    } else if (typeof process !== 'undefined') {
      return process.hrtime()[1] / 1e+6
    } else {
      return new Date().getTime()
    }
  }
}
